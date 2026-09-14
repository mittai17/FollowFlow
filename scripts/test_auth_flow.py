import asyncio
import json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path='/usr/bin/chromium')
        context = await browser.new_context(viewport={'width': 1280, 'height': 900})
        page = await context.new_page()

        print("1. Testing Sign-In Wall: Navigating to /dashboard without session...")
        await page.goto("http://localhost:3000/dashboard")
        await page.wait_for_timeout(2000)
        current_url = page.url
        print(f"   Current URL after redirect: {current_url}")
        assert "/login" in current_url, f"Expected /login in URL, got {current_url}"
        await page.screenshot(path="/home/mittai/Projects/aws-hack/screenshots/step1_wall_redirect.png")
        print("   ✓ Redirect to sign-in wall confirmed!")

        print("2. Testing 1-Click Directory Sign-In...")
        # Wait for the user directory buttons to appear
        sign_in_btn = page.locator('button:has-text("Sign In")').first
        await sign_in_btn.wait_for(state="visible", timeout=5000)
        await sign_in_btn.click()
        await page.wait_for_timeout(2000)

        current_url = page.url
        print(f"   Current URL after 1-click sign-in: {current_url}")
        assert "/dashboard" in current_url, f"Expected /dashboard after login, got {current_url}"

        # Capture authenticated dashboard screenshot
        await page.screenshot(path="/home/mittai/Projects/aws-hack/screenshots/step2_authenticated_dashboard.png")
        print("   ✓ Authenticated dashboard loaded successfully!")

        # Verify localStorage has followflow_auth_session
        session_raw = await page.evaluate("() => localStorage.getItem('followflow_auth_session')")
        print(f"   Session stored: {session_raw[:80]}...")
        assert session_raw is not None, "Expected session in localStorage"

        print("3. Testing Sign-Out Button in Sidebar...")
        # Locate sign-out button
        sign_out_btn = page.locator("button[title='Sign Out of FollowFlow']")
        await sign_out_btn.wait_for(state="visible", timeout=5000)
        await sign_out_btn.click()
        await page.wait_for_timeout(2000)

        current_url = page.url
        print(f"   Current URL after sign-out: {current_url}")
        assert "/login" in current_url, f"Expected /login after sign-out, got {current_url}"

        session_after = await page.evaluate("() => localStorage.getItem('followflow_auth_session')")
        print(f"   Session after logout: {session_after}")
        assert session_after is None, "Expected session to be cleared after sign-out"

        await page.screenshot(path="/home/mittai/Projects/aws-hack/screenshots/step3_signed_out.png")
        print("   ✓ Sign-out completed and session cleared!")

        await browser.close()
        print("\nAll authentication flow tests passed successfully! 🎉")

if __name__ == "__main__":
    asyncio.run(main())
