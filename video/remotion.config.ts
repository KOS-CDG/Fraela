/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
// Frames are photographs, so keep the intermediate JPEGs close to lossless.
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// The film uses the same photos as the website: staticFile("photos/0406-l.webp")
// reads public/media/2026/photos/0406-l.webp from the site.
Config.setPublicDir("../public/media/2026");
