# Jira Assistant Bookmarklet

A lightweight browser bookmarklet that injects a Jira Assistant panel directly into your active Jira browser tab. The panel runs in a **Shadow DOM** to prevent CSS leakage or collision with Jira's own stylesheet. It communicates directly with Jira's REST APIs to automate tasks like creating Test Cases, Test Executions, and Bugs.

---

## Features

- **Shadow DOM Encapsulation**: Renders the assistant interface isolated from the host page's styles.
- **Task Automation**:
  - **Create Test Execution (Testdurchführung erstellen)**
  - **Create Test Case (Testfall erstellen)**
  - **Create Bug (Bug erstellen)**
- **Configuration Panel**: Customizable settings for sprint ID, version, system/browser properties, t-Kennung, etc.
- **Dynamic CSS Injection**: Bundles styles (`panel.css`) directly into the bookmarklet.

---

## File Structure

- `panel.js` - Main entry point and event handlers for the UI.
- `panel_bookmarklet.html` - HTML layout injected into the Shadow DOM.
- `panel.css` - Stylesheet for the UI components.
- `utils/` - JavaScript utilities (API validation, endpoints, Jira constants, etc.).
- `build.js` - Node.js script that packages all files and templates into a single `bundle.js` file.
- `minify.js` - Node.js script that minifies `bundle.js` and formats it into the single-line executable bookmarklet code (`bookmarklet.txt`).

---

## How to Generate the Bookmarklet

To compile the source files into the bookmarklet format, you need to run the Node.js build pipeline:

1. **Bundle Source Files**  
   Run the build script to bundle all JavaScript dependencies, HTML templates, and CSS stylesheets into `bundle.js`:
   ```bash
   node build.js
   ```

2. **Minify and Format**  
   Run the minification script to strip comments/newlines, compress symbols, prepend the `javascript:` URI scheme, and output the final bookmarklet code:
   ```bash
   node minify.js
   ```
   This will generate a `bookmarklet.txt` file in the root directory.

---

## How to Install and Run in Your Browser

### 1. Installation

1. Open the generated [bookmarklet.txt](file:///c:/Users/myuser/jira_assistant_bookmarklet/bookmarklet.txt) and **copy its entire content**. The content should start with `javascript:(function(){...`.
2. Make sure your browser's Bookmarks/Favorites bar is visible (shortcut: `Ctrl + Shift + B` on Chrome/Edge/Firefox).
3. Right-click anywhere on the Bookmarks bar and choose **Add Page** (Chrome/Edge) or **Add Bookmark** (Firefox).
4. Configure the bookmark:
   - **Name**: `Jira Assistant` (or any name you prefer)
   - **URL / Location / Address**: Paste the copied code from `bookmarklet.txt`.
5. Click **Save**.

### 2. Execution

1. Navigate to your Jira homepage or any Jira ticket/project page in your browser.
2. **Log in** to Jira if you haven't already (the bookmarklet uses your active browser session/cookie to authenticate REST requests).
3. Click the **Jira Assistant** bookmark in your Bookmarks bar.
4. The assistant panel will appear on the right side of the page. You can fill out the form fields and trigger creations directly!
