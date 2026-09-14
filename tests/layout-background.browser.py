"""Local visual regression checks. Requires Python Playwright and Microsoft Edge."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:4318')
parser.add_argument('--output', default='.run/layout-background')
args = parser.parse_args()
assert urlparse(args.url).hostname in ('localhost', '127.0.0.1', '::1')
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
report = {'viewports': [], 'errors': []}

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900}, reduced_motion='no-preference')
    page.on('pageerror', lambda error: report['errors'].append(str(error)))
    page.goto(args.url + '/knowledge?collection=meshfree', wait_until='load', timeout=60000)
    page.locator('.fluid-canvas').wait_for(state='visible')
    page.locator('.article-row').first.wait_for(state='visible')

    for width, height in [(1440, 900), (1024, 768), (768, 1024), (390, 844)]:
        page.set_viewport_size({'width': width, 'height': height})
        page.evaluate('window.scrollTo(0, 0)')
        page.wait_for_timeout(250)
        state = page.evaluate('''() => ({
          width: innerWidth,
          height: innerHeight,
          documentWidth: document.documentElement.scrollWidth,
          canvas: {
            width: document.querySelector('.fluid-canvas').clientWidth,
            height: document.querySelector('.fluid-canvas').clientHeight
          },
          pointerEvents: getComputedStyle(document.querySelector('.fluid-canvas')).pointerEvents,
          collectionCount: document.querySelectorAll('.knowledge-collection-strip button').length,
          articleCount: document.querySelectorAll('.article-row').length,
          layoutColumns: getComputedStyle(document.querySelector('.discovery-layout')).gridTemplateColumns,
          runningCSS: document.getAnimations().filter(a => a.playState === 'running').length,
          panel: getComputedStyle(document.querySelector('.article-row')).borderBottomColor,
        })''')
        assert state['documentWidth'] <= width, state
        assert state['canvas'] == {'width': width, 'height': height}, state
        assert state['collectionCount'] == 6, state
        assert state['articleCount'] >= 6, state
        assert state['runningCSS'] >= 5, state
        assert state['pointerEvents'] == 'none'
        frame1 = page.locator('.fluid-canvas').evaluate('(c) => c.toDataURL()')
        page.wait_for_timeout(450)
        frame2 = page.locator('.fluid-canvas').evaluate('(c) => c.toDataURL()')
        assert frame1 != frame2, 'Ambient flow must move without pointer input'
        page.screenshot(path=str(output / f'knowledge-{width}.png'), full_page=False)
        state['ambientFrameChanges'] = True
        report['viewports'].append(state)

    # Reading and tool workspaces use a stable white background and do not mount the
    # animation at all, so no hidden requestAnimationFrame loop consumes resources.
    focus_pages = [
        ('/knowledge/navier-stokes', '.reading-page'),
        ('/simulation', '.simulation-lab-banner'),
        ('/formulas/convert', '.formula-converter-page'),
        ('/modelica/projects/demo-project/editor', '.modelica-ide'),
    ]
    for path, selector in focus_pages:
        page.goto(args.url + path, wait_until='load', timeout=60000)
        page.locator(selector).wait_for(state='visible')
        assert page.locator('.fluid-canvas').count() == 0, path
        assert page.locator('.fluid-backdrop').count() == 0, path
    report['focusPagesWithoutFlowAnimation'] = [path for path, _ in focus_pages]

    page.goto(args.url + '/knowledge?collection=meshfree', wait_until='load', timeout=60000)
    page.locator('.fluid-canvas').wait_for(state='visible')

    page.set_viewport_size({'width': 1440, 'height': 900})
    page.mouse.move(120, 150)
    page.mouse.move(900, 450, steps=12)
    page.wait_for_timeout(150)
    energy = page.locator('.fluid-backdrop').evaluate('(e) => Number(e.style.getPropertyValue("--flow-energy"))')
    assert energy > .1, energy
    report['pointerEnergy'] = energy
    page.screenshot(path=str(output / 'pointer-flow.png'))

    # The effect is mounted above the route tree and must survive client navigation.
    page.get_by_role('link', name='CFD菜鸟首页').click()
    page.locator('.home-page').wait_for()
    assert page.locator('.fluid-canvas').count() == 1
    assert page.locator('.cfd-intro').is_visible()
    assert page.locator('.intro-title').text_content().strip() == 'CFD菜鸟'
    assert page.locator('.intro-shard').count() == 4
    assert 'fangsong' in page.locator('.intro-title').evaluate('(e) => getComputedStyle(e).fontFamily.toLowerCase()')
    assert page.locator('.intro-enter, .intro-copy, .intro-readout').count() == 0
    assert page.locator('.home-interface').get_attribute('inert') is not None
    assert page.locator('.app-header').evaluate("e => getComputedStyle(e).visibility") == 'hidden'
    report['homeIntroVisualContent'] = 'animation-only'
    page.screenshot(path=str(output / 'home-intro-desktop.png'))

    # Moving the mouse or turning the wheel must not enter the functional home page.
    page.mouse.move(160, 180)
    page.mouse.move(520, 300, steps=8)
    page.mouse.wheel(0, 520)
    page.wait_for_timeout(900)
    assert page.locator('.cfd-intro').is_visible()
    assert not page.locator('.home-page').evaluate('(e) => e.classList.contains("interface-ready")')
    pointer_response = page.locator('.fluid-canvas').evaluate('''canvas => ({
      energy: Number(canvas.dataset.pointerEnergy),
      wakes: Number(canvas.dataset.wakes),
      trail: Number(canvas.dataset.pointerTrail),
      sparks: Number(canvas.dataset.sparks),
      ripples: Number(canvas.dataset.ripples),
      frame: Number(canvas.dataset.frame)
    })''')
    assert pointer_response['energy'] > .1, pointer_response
    assert pointer_response['wakes'] > 0, pointer_response
    assert pointer_response['trail'] > 6, pointer_response
    assert pointer_response['sparks'] > 0, pointer_response
    assert pointer_response['ripples'] > 0, pointer_response
    assert pointer_response['frame'] > 0, pointer_response
    report['homeIntroPointerResponse'] = pointer_response
    report['homeIntroIgnoresMoveAndWheel'] = True

    page.locator('.cfd-intro').click(position={'x': 120, 'y': 120})
    page.wait_for_function('''() => {
      const first = document.querySelector('.intro-shard');
      if (!first) return false;
      const matrix = new DOMMatrixReadOnly(getComputedStyle(first).transform);
      return matrix.m41 < -5 && matrix.m42 < -5;
    }''', timeout=2500)
    page.wait_for_timeout(180)
    transition = page.evaluate('''() => ({
      splitX: document.querySelector('.cfd-intro').style.getPropertyValue('--split-x'),
      splitY: document.querySelector('.cfd-intro').style.getPropertyValue('--split-y'),
      shardTranslations: [...document.querySelectorAll('.intro-shard')].map(element => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return { x: matrix.m41, y: matrix.m42 };
      }),
      interfaceOpacity: Number(getComputedStyle(document.querySelector('.home-interface')).opacity),
      shardCount: document.querySelectorAll('.intro-shard').length
    })''')
    assert transition['splitX'] == '120px' and transition['splitY'] == '120px', transition
    translations = transition['shardTranslations']
    assert translations[0]['x'] < -5 and translations[0]['y'] < -5, transition
    assert translations[1]['x'] > 5 and translations[1]['y'] < -5, transition
    assert translations[2]['x'] < -5 and translations[2]['y'] > 5, transition
    assert translations[3]['x'] > 5 and translations[3]['y'] > 5, transition
    assert 0 < transition['interfaceOpacity'] < 1, transition
    assert transition['shardCount'] == 4, transition
    report['homeIntroCrossfade'] = transition
    page.screenshot(path=str(output / 'home-intro-split.png'))
    page.locator('.cfd-intro').wait_for(state='detached', timeout=3000)
    assert page.locator('.home-page').evaluate('(e) => e.classList.contains("interface-ready")')
    assert page.locator('.home-interface').get_attribute('inert') is None
    assert page.locator('.app-header').evaluate("e => getComputedStyle(e).visibility") == 'visible'
    report['homeIntroClickReveal'] = True

    frame_intervals = page.evaluate('''() => new Promise(resolve => {
      const values = []; let previous = performance.now();
      function sample(now) {
        values.push(now - previous); previous = now;
        if (values.length < 75) requestAnimationFrame(sample);
        else resolve(values.slice(5).sort((a, b) => a - b));
      }
      requestAnimationFrame(sample);
    })''')
    p95 = frame_intervals[int(len(frame_intervals) * .95)]
    # Desktop headless compositing can occasionally skip three display intervals while
    # rasterizing the full viewport; mobile smoothness is checked separately below.
    assert p95 < 65, p95
    report['animationFrameP95Ms'] = round(p95, 2)
    report['canvasQuality'] = page.locator('.fluid-canvas').get_attribute('data-quality')

    page.set_viewport_size({'width': 390, 'height': 844})
    page.reload(wait_until='load')
    assert page.locator('.cfd-intro').is_visible()
    assert page.locator('.intro-title').text_content().strip() == 'CFD菜鸟'
    page.screenshot(path=str(output / 'home-intro-mobile.png'))

    # A mobile browser can emit resize bursts while its address bar expands. Those events
    # must not synchronously clear the current Canvas frame.
    resize_frames = page.locator('.fluid-canvas').evaluate('''canvas => {
      const before = canvas.toDataURL();
      for (let i = 0; i < 12; i += 1) window.dispatchEvent(new Event('resize'));
      return { before, after: canvas.toDataURL() };
    }''')
    assert resize_frames['before'] == resize_frames['after']
    report['mobileResizeKeepsCurrentFrame'] = True

    page.locator('.cfd-intro').click(position={'x': 80, 'y': 120})
    page.locator('.cfd-intro').wait_for(state='detached', timeout=3000)
    assert page.locator('.hero-visual').is_visible(), 'Keep the original flow illustration on mobile'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    mobile_intervals = page.evaluate('''() => new Promise(resolve => {
      const values = []; let previous = performance.now();
      function sample(now) {
        values.push(now - previous); previous = now;
        if (values.length < 75) requestAnimationFrame(sample);
        else resolve(values.slice(5).sort((a, b) => a - b));
      }
      requestAnimationFrame(sample);
    })''')
    mobile_p95 = mobile_intervals[int(len(mobile_intervals) * .95)]
    assert mobile_p95 < 55, mobile_p95
    report['mobileAnimationFrameP95Ms'] = round(mobile_p95, 2)
    report['mobileCanvasQuality'] = page.locator('.fluid-canvas').get_attribute('data-quality')
    report['homeMobileVisual'] = True
    page.screenshot(path=str(output / 'home-mobile.png'))

    # Reduced-motion mode keeps the animation-only intro visible at a lower canvas rate.
    page.emulate_media(reduced_motion='reduce')
    page.wait_for_timeout(250)
    assert page.locator('.fluid-canvas').is_visible()
    assert page.locator('.fluid-canvas').get_attribute('data-motion') == 'reduced-rate'
    reduced_frame = page.locator('.fluid-canvas').evaluate('(c) => c.toDataURL()')
    page.wait_for_timeout(350)
    assert reduced_frame != page.locator('.fluid-canvas').evaluate('(c) => c.toDataURL()')
    page.emulate_media(reduced_motion='no-preference')
    page.wait_for_timeout(400)
    assert page.locator('.fluid-canvas').is_visible()
    assert page.locator('.fluid-canvas').get_attribute('data-motion') == 'full'
    report['liveMotionPreference'] = 'passed'

    # The click-only intro remains usable when the operating system requests less motion.
    page.emulate_media(reduced_motion='reduce')
    page.reload(wait_until='load')
    assert page.locator('.cfd-intro').is_visible()
    assert page.locator('.fluid-canvas').is_visible()
    page.locator('.cfd-intro').click(position={'x': 80, 'y': 120})
    assert page.locator('.cfd-intro').evaluate('(e) => e.classList.contains("leaving")')
    page.wait_for_function('''() => {
      const first = document.querySelector('.intro-shard');
      if (!first) return false;
      const matrix = new DOMMatrixReadOnly(getComputedStyle(first).transform);
      return matrix.m41 < -5 && matrix.m42 < -5;
    }''', timeout=2500)
    reduced_transforms = page.locator('.intro-shard').evaluate_all('''elements => elements.map(element => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return { x: matrix.m41, y: matrix.m42 };
    })''')
    assert reduced_transforms[0]['x'] < -5 and reduced_transforms[0]['y'] < -5, reduced_transforms
    assert reduced_transforms[3]['x'] > 5 and reduced_transforms[3]['y'] > 5, reduced_transforms
    page.locator('.cfd-intro').wait_for(state='detached', timeout=3500)
    report['reducedMotionClickIntro'] = 'passed'
    assert not report['errors'], report['errors']
    browser.close()

(output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
