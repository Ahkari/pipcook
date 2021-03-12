import {
  PipelineMeta,
  ScriptConfig,
  ScriptType,
  PipcookScript,
  constants
} from '@pipcook/pipcook-core';
import * as path from 'path';
import { parse } from 'url';
import { fetchWithCache } from './cache';
import * as queryString from 'query-string';

export const downloadScript = async (scriptDir: string, scriptOrder: number, url: string, type: ScriptType, enableCache = true): Promise<PipcookScript> => {
  const urlObj = parse(url);
  const baseName = path.parse(urlObj.pathname).base;
  const localPath = path.join(scriptDir, `${scriptOrder}-${baseName}`);
  const { query } = queryString.parse(urlObj.query);
  // maybe should copy the script with COW
  await fetchWithCache(constants.PIPCOOK_SCRIPT_PATH, url, localPath, enableCache);
  return {
    name: baseName,
    path: localPath,
    type,
    query
  };
};

export const prepareScript = async (pipelineMeta: PipelineMeta, scriptDir: string, enableCache = true): Promise<ScriptConfig> => {
  const scripts: ScriptConfig = {
    dataSource: null,
    dataflow: null,
    model: null
  };
  let scriptOrder = 0;
  scripts.dataSource
    = await downloadScript(scriptDir, scriptOrder, pipelineMeta.dataSource, ScriptType.DataSource, enableCache);
  scriptOrder++;
  if (pipelineMeta.dataflow) {
    scripts.dataflow = [];
    for (let dataflowUri of pipelineMeta.dataflow) {
      scripts.dataflow.push(await downloadScript(scriptDir, scriptOrder, dataflowUri, ScriptType.Dataflow, enableCache));
      scriptOrder++;
    }
  }
  scripts.model = await downloadScript(scriptDir, scriptOrder, pipelineMeta.model, ScriptType.Model, enableCache);
  return scripts;
};