"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMPDIRECTORY'] || '';
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const os = __importStar(require("os"));
const util = __importStar(require("util"));
const osPlat = os.platform();
function getOperatorSDK(version) {
    return __awaiter(this, void 0, void 0, function* () {
        // check cache
        let toolPath;
        toolPath = tc.find('operator-sdk', version);
        if (!toolPath) {
            // download, extract, cache
            toolPath = yield acquireOperatorSDK(version);
            core.debug('operator-sdk is cached under ' + toolPath);
        }
        core.addPath(toolPath);
    });
}
exports.getOperatorSDK = getOperatorSDK;
function acquireOperatorSDK(version) {
    return __awaiter(this, void 0, void 0, function* () {
        //
        // Download - a tool installer intimately knows how to get the tool (and construct urls)
        //
        let fileName = getFileName();
        let downloadUrl = getDownloadUrl(version, fileName);
        let downloadPath = null;
        try {
            downloadPath = yield tc.downloadTool(downloadUrl);
        }
        catch (error) {
            core.debug(error);
            throw `Failed to download version ${version}: ${error}`;
        }
        return yield tc.cacheFile(downloadPath, 'operator-sdk', 'operator-sdk', version);
    });
}
function getFileName() {
    switch (osPlat) {
        case "linux":
            return "operator-sdk-v0.10.0-x86_64-linux-gnu";
        case "win32":
            throw `Unsupported platform: ${osPlat}`;
        case "darwin":
            return "operator-sdk-v0.10.0-x86_64-apple-darwin";
        default:
            throw `Unknown platform: ${osPlat}`;
    }
}
function getDownloadUrl(version, filename) {
    return util.format('https://github.com/operator-framework/operator-sdk/releases/download/%s/%s', version, filename);
}
