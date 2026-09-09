"""Check the offline presentation at desktop/mobile widths and each video tab."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--presentation',default='D:/openclaw/codextemp/jilong_sph3d/cloud_480k_90min/presentation_preview')
    args=p.parse_args();out=Path(args.presentation)
    edge=Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    with sync_playwright() as browser_tools:
        browser=browser_tools.chromium.launch(executable_path=str(edge),headless=True)
        page=browser.new_page(viewport={'width':1280,'height':950})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto((out/'index.html').as_uri())
        checks=[]
        if page.locator('video').count()>1:
            assert page.locator('video').count()==8
            for video in page.locator('video').all():
                video.evaluate('(v)=>{v.preload="metadata";v.load()}')
                video.evaluate('(v)=>new Promise((resolve,reject)=>{if(v.readyState>=1)return resolve();v.addEventListener("loadedmetadata",resolve,{once:true});v.addEventListener("error",reject,{once:true})})')
                state=video.evaluate('(v)=>({source:v.currentSrc,duration:v.duration,label:v.getAttribute("aria-label")})')
                assert state['duration']>20,state
                video.evaluate('(v)=>{v.currentTime=5}')
                video.evaluate('(v)=>new Promise(resolve=>{if(!v.seeking)return resolve();v.addEventListener("seeked",resolve,{once:true})})')
                assert video.evaluate('(v)=>v.readyState>=2 && Math.abs(v.currentTime-5)<.2')
                checks.append(state)
            # Make sure playback advances, and starting another video pauses the first.
            first,second=page.locator('video').all()[:2]
            first.evaluate('(v)=>{v.muted=true;return v.play()}')
            page.wait_for_timeout(700)
            assert first.evaluate('(v)=>v.currentTime>5.3')
            second.evaluate('(v)=>{v.muted=true;return v.play()}')
            assert first.evaluate('(v)=>v.paused')
            second.evaluate('(v)=>v.pause()')
        else:
            page.wait_for_function("document.querySelector('video').readyState>=1")
            for button in page.locator('[data-angle]').all():
                angle=button.get_attribute('data-angle')
                button.click()
                page.wait_for_function("document.querySelector('video').readyState>=1")
                state=page.locator('video').evaluate('(v)=>({source:v.currentSrc,duration:v.duration})')
                assert state['source'].endswith(angle+'.mp4') and state['duration']>0,state
                assert page.locator('[aria-pressed="true"]').count()==1
                checks.append(state)
            page.locator('[data-angle="01_southeast"]').click()
            page.wait_for_function("document.querySelector('video').readyState>=1")
        page.screenshot(path=str(out/'images/interface_desktop.png'),full_page=True)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        page.set_viewport_size({'width':390,'height':844})
        page.screenshot(path=str(out/'images/interface_mobile.png'),full_page=True)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        assert not errors,errors
        browser.close()
    result={'desktop_and_mobile_layout':'passed','javascript_errors':errors,'video_tabs':checks}
    (out/'interface_check.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result,indent=2))

if __name__=='__main__':main()
