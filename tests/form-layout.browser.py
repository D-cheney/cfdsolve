"""Form-control alignment regression checks. Requires Python Playwright and Microsoft Edge."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:4317')
parser.add_argument('--output', default='.run/form-layout')
args = parser.parse_args()
assert urlparse(args.url).hostname in ('localhost', '127.0.0.1', '::1')
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)

routes = [
    '/knowledge', '/algorithms', '/formulas', '/formulas/convert', '/search',
    '/simulation', '/simulation/lid-driven-cavity', '/simulation/lab',
    '/modelica/projects', '/modelica/projects/demo-project/editor',
    '/forum', '/forum/new', '/forum/posts/1001'
]
viewports = [(1440, 900), (768, 1024), (390, 844)]
report = {'pages': [], 'errors': []}

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page()
    page.on('pageerror', lambda error: report['errors'].append(str(error)))

    for width, height in viewports:
        page.set_viewport_size({'width': width, 'height': height})
        for route in routes:
            page.goto(args.url + route, wait_until='load', timeout=60000)
            page.wait_for_timeout(140)
            state = page.evaluate('''() => {
              const controls = [...document.querySelectorAll('input,select,textarea')].filter(element => {
                const rect = element.getBoundingClientRect()
                const style = getComputedStyle(element)
                return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
              }).map(element => {
                const rect = element.getBoundingClientRect()
                const style = getComputedStyle(element)
                return {
                  tag: element.tagName.toLowerCase(),
                  type: element.type || '',
                  left: rect.left,
                  right: rect.right,
                  width: rect.width,
                  minWidth: style.minWidth,
                  maxWidth: style.maxWidth
                }
              })
              return {
                documentWidth: document.documentElement.scrollWidth,
                controls,
                overflow: controls.filter(control => control.left < -1 || control.right > innerWidth + 1)
              }
            }''')
            assert state['documentWidth'] <= width, (width, route, state['documentWidth'])
            assert not state['overflow'], (width, route, state['overflow'])
            assert all(control['width'] <= width for control in state['controls']), (width, route, state['controls'])
            report['pages'].append({
                'viewport': f'{width}x{height}',
                'route': route,
                'controls': len(state['controls']),
                'documentWidth': state['documentWidth']
            })

    # Borderless inputs inside compound fields should highlight the complete field shell.
    page.set_viewport_size({'width': 390, 'height': 844})
    focus_checks = [
        ('/search', '.page-search input', '.page-search'),
        ('/simulation/lab', '.unit-input input', '.unit-input')
    ]
    for route, input_selector, shell_selector in focus_checks:
        page.goto(args.url + route, wait_until='load', timeout=60000)
        target = page.locator(input_selector).first
        target.focus()
        input_shadow = target.evaluate('(element) => getComputedStyle(element).boxShadow')
        input_outline = target.evaluate('(element) => getComputedStyle(element).outlineStyle')
        shell_shadow = page.locator(shell_selector).first.evaluate('(element) => getComputedStyle(element).boxShadow')
        assert input_shadow == 'none', (route, input_shadow)
        assert input_outline == 'none', (route, input_outline)
        assert shell_shadow != 'none', (route, shell_shadow)

    # Global search uses a bottom keyline instead of a floating inner input outline.
    page.goto(args.url + '/knowledge', wait_until='load', timeout=60000)
    page.locator('.search-trigger').click()
    page.locator('.search-modal-input input').wait_for(state='visible')
    modal_input = page.locator('.search-modal-input input')
    assert modal_input.evaluate('(element) => getComputedStyle(element).boxShadow') == 'none'
    assert modal_input.evaluate('(element) => getComputedStyle(element).outlineStyle') == 'none'
    assert page.locator('.search-modal').evaluate('(element) => element.getBoundingClientRect().right <= innerWidth')
    page.screenshot(path=str(output / 'search-modal-mobile.png'))

    assert not report['errors'], report['errors']
    browser.close()

(output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'checkedPages': len(report['pages']), 'errors': report['errors']}, ensure_ascii=False))
