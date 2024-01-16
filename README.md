# GAS Scripts

This repository manages useful google app scripts, and contains easy development base for GAS.
To manage GAS in the way, you need to add new subproject in this project and do some setup like creating GAS project and
so on.

## Repository Structure

- `buildSrc`: Directory containing custom build logic related to clasp, which is cli command for GAS to control.
- `thesis-notifier`: Thesis Notifier
    - Fetch latest thesis data from arxiv that matches prepared search query, then summarize it using GPT-4 model in
      OpenAPI, translate it into Japanese.

## How to create new GAS script

1. Add subproject and create GAS script by executing clasp create command, which will create `.clasp.json`
   and `appscript.json` containing script id and application manifest.
2. Create script itself using GAS, then push it.
3. Add schedule to execute script if you need it.

## Thesis Notifier

- `fetchArxivData`: Main entry point.
- `createTimeDrivenTriggers`: Register trigger that executes this script by the call of this function.

### How to set up

1. **Log in using clasp**:
   ```
   ./gradlew :thesis-notifier:claspLogin
   ```

2. **Push using clasp**:
   ```
   ./gradlew :thesis-notifier:claspPush
   ```

2. **Deploy using clasp**:
   ```
   ./gradlew :thesis-notifier:claspDeploy
   ```

### How to use this

1. **Configure google spread sheet to persist in for storage part of this script**:
    - `fetchArxivData` script needs spread sheet id to persist in.
    - Create new spread sheet in advance, then specify spread sheet id in `CONFIG.SPREADSHEET_ID`.

2. **Acquire LINE Notify token**:
    - Newly acquire LINE Notify token, then specify it in `CONFIG.LINE_NOTIFY_TOKEN`.

3. **Configure OpenAI API Key**:
    - Acquire OpenAI API Key, then specify it in `CONFIG.OPENAPI_KEY`.
    - Specify OpenAI API Endpoint in `CONFIG.OPENAPI_ENDPOINT`, the default URL already specified is good for now.

4. **Configure schedule to execute this script**:
    - Execute `createTimeDrivenTriggers` function to register schedule to execute `fetchArxivData` on a daily basis.
