import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as fs from 'fs';
import * as os from 'os';
import * as util from 'util';

const osPlat: string = os.platform();

export async function getOperatorSDK(version: string) {
  // check cache
  let toolPath: string;
  toolPath = tc.find('operator-sdk', version);

  if (!toolPath) {
    // download, extract, cache
    toolPath = await acquireOperatorSDK(version);
    core.debug('operator-sdk is cached under ' + toolPath);
  }

  core.addPath(toolPath);
}

async function acquireOperatorSDK(version: string): Promise<string> {
  //
  // Download - a tool installer intimately knows how to get the tool (and construct urls)
  //
  let fileName: string = getFileName(version);
  let downloadUrl: string = getDownloadUrl(version, fileName);
  let downloadPath: string | null = null;
  try {
    downloadPath = await tc.downloadTool(downloadUrl);
  } catch (error) {
    core.debug(error);
    throw `Failed to download version ${version}: ${error}`;
  }

  fs.chmodSync(downloadPath, '755');

  return await tc.cacheFile(downloadPath, 'operator-sdk', 'operator-sdk', version);
}

function getFileName(version: string): string {
  switch (osPlat) {
    case "linux":
      return `operator-sdk-${version}-x86_64-linux-gnu`;
    case "win32":
      throw `Unsupported platform: ${osPlat}`;
    case "darwin":
      return `operator-sdk-${version}-x86_64-apple-darwin`;
    default:
      throw `Unknown platform: ${osPlat}`;
  }
}

function getDownloadUrl(version: string, filename: string): string {
  return util.format('https://github.com/operator-framework/operator-sdk/releases/download/%s/%s', version, filename);
}
