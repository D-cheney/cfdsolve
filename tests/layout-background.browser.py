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
        assert state['runningCSS'] >= 8, state
        assert state['pointerEvents'] == 'none'
        frame1 = page.locator('.fluid-canvas').evaluate('(c) => c.toDataURL()')
        page.wait_for_timeout(450)
        frame2 = page.locator('.fluid-canvas').evaluate('(c) => c.toDataURL()')
        assert frame1 != frame2, 'Ambient flow must move without pointer input'
        page.screenshot(path=str(output / f'knowledge-{width}.png'), full_page=False)
        state['ambientFrameChanges'] = True
        report['viewports'].append(state)

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
    assert page.get_by_role('heading', name='CFD菜鸟').is_visible()
    page.screenshot(path=str(output / 'home-intro-desktop.png'))

    # Moving the mouse or turning the wheel must not enter the functional home page.
    page.mouse.move(160, 180)
    page.mouse.move(520, 300, steps=8)
    page.mouse.wheel(0, 520)
    page.wait_for_timeout(900)
    assert page.locator('.cfd-intro').is_visible()
    assert not page.locator('.home-page').evaluate('(e) => e.classList.contains("interface-ready")')
    report['homeIntroIgnoresMoveAndWheel'] = True

    page.locator('.intro-enter').click()
    page.locator('.cfd-intro').wait_for(state='detached', timeout=3000)
    assert page.locator('.home-page').evaluate('(e) => e.classList.contains("interface-ready")')
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
    assert p95 < 55, p95
    report['animationFrameP95Ms'] = round(p95, 2)
    report['canvasQuality'] = page.locator('.fluid-canvas').get_attribute('data-quality')

    page.set_viewport_size({'width': 390, 'height': 844})
    assert page.locator('.hero-visual').is_visible(), 'Keep the original flow illustration on mobile'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    report['homeMobileVisual'] = True
    page.screenshot(path=str(output / 'home-mobile.png'))

    # Changing the system preference must stop and resume both CSS and Canvas.
    page.emulate_media(reduced_motion='reduce')
    page.wait_for_timeout(200)
    assert page.locator('.fluid-canvas').is_hidden()
    assert page.evaluate("document.getAnimations().filter(a=>a.playState==='running').length") == 0
    stopped = page.locator('.fluid-canvas').evaluate('(c) => c.toDataURL()')
    page.wait_for_timeout(350)
    assert stopped == page.locator('.fluid-canvas').evaluate('(c) => c.toDataURL()')
    page.emulate_media(reduced_motion='no-preference')
    page.wait_for_timeout(400)
    assert page.locator('.fluid-canvas').is_visible()
    assert stopped != page.locator('.fluid-canvas').evaluate('(c) => c.toDataURL()')
    report['liveMotionPreference'] = 'passed'

    # The click-only intro remains usable when the operating system requests less motion.
    page.emulate_media(reduced_motion='reduce')
    page.reload(wait_until='load')
    assert page.locator('.cfd-intro').is_visible()
    assert page.evaluate("document.getAnimations().filter(a=>a.playState==='running').length") == 0
    page.locator('.intro-enter').click()
    assert page.locator('.cfd-intro').count() == 0
    report['reducedMotionClickIntro'] = 'passed'
    assert not report['errors'], report['errors']
    browser.close()

(output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
