import { pickBy } from 'lodash';

import fetchDependencies from './fetch-dependencies';
import dependenciesToQuery from './dependencies-to-query';

import setScreen from '../status-screen';

let loadedDependencyCombination: ?string = null;
let manifest = null;

type NPMDependencies = {
  [dependency: string]: string,
};

/**
 * This fetches the manifest and dependencies from the
 * @param {*} dependencies
 */
export default async function loadDependencies(dependencies: NPMDependencies) {
  let isNewCombination = false;
  if (Object.keys(dependencies).length !== 0) {
    // We filter out all @types, as they are not of any worth to the bundler
    const dependenciesWithoutTypings = pickBy(
      dependencies,
      (val, key) => !key.includes('@types')
    );

    const depQuery = dependenciesToQuery(dependenciesWithoutTypings);

    if (loadedDependencyCombination !== depQuery) {
      isNewCombination = true;

      const data = await fetchDependencies(dependenciesWithoutTypings);

      // Mark that the last requested url is this
      loadedDependencyCombination = depQuery;
      manifest = data;

      setScreen({ type: 'loading', text: 'Transpiling Modules...' });
    }
  } else {
    manifest = null;
  }

  return { manifest, isNewCombination };
}
