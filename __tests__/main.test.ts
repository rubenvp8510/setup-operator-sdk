import io = require('@actions/io');
import fs = require('fs');
import os = require('os');
import path = require('path');

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;
import * as installer from '../src/installer';

describe('installer tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  }, 100000);

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  it('Acquires version of operator-sdk if no matching version is installed', async () => {
    await installer.getOperatorSDK('v0.9.0');
    const binaryDir = path.join(toolDir, 'operator-sdk', '0.9.0', os.arch());

    expect(fs.existsSync(`${binaryDir}.complete`)).toBe(true);
    expect(fs.existsSync(path.join(binaryDir, 'operator-sdk'))).toBe(true);
  }, 100000);

  it('Throws if no location contains correct operator-sdk version', async () => {
    let thrown = false;
    try {
      await installer.getOperatorSDK('1000.0');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
  });

  it('Uses version of operator-sdk installed in cache', async () => {
    const binaryDir: string = path.join(toolDir, 'operator-sdk', '250.0.0', os.arch());
    await io.mkdirP(binaryDir);
    fs.writeFileSync(`${binaryDir}.complete`, 'dummy content');
    // This will throw if it doesn't find it in the cache (because no such version exists)
    await installer.getOperatorSDK('250.0');
    return;
  });

  it('Doesnt use version of operator-sdk that was only partially installed in cache', async () => {
    const binaryDir: string = path.join(toolDir, 'operator-sdk', '0.0.1', os.arch());
    await io.mkdirP(binaryDir);
    let thrown = false;
    try {
      // This will throw if it doesn't find it in the cache (because no such version exists)
      await installer.getOperatorSDK('v0.0.1');
    } catch {
      thrown = true;
    }
    expect(thrown).toBe(true);
    return;
  });
});
