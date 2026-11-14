import {Config} from "@remotion/cli/config";

Config.setEntryPoint("./src/index.ts");
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
