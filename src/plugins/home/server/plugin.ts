/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { CoreSetup, Plugin, PluginInitializerContext } from 'opensearch-dashboards/server';
import {
  TutorialsRegistry,
  TutorialsRegistrySetup,
  TutorialsRegistryStart,
  SampleDataRegistry,
  SampleDataRegistrySetup,
  SampleDataRegistryStart,
} from './services';
import { UsageCollectionSetup } from '../../usage_collection/server';
import { capabilitiesProvider } from './capabilities_provider';
import { sampleDataTelemetry, homepageSavedObjectType } from './saved_objects';
import { registerRoutes } from './routes';
import { uiSettings, searchOverviewPageUISetting } from './ui_settings';

interface HomeServerPluginSetupDependencies {
  usageCollection?: UsageCollectionSetup;
}

export class HomeServerPlugin implements Plugin<HomeServerPluginSetup, HomeServerPluginStart> {
  constructor(private readonly initContext: PluginInitializerContext) {}
  private readonly tutorialsRegistry = new TutorialsRegistry();
  // @ts-expect-error TS2729 TODO(ts-error): fixme
  private readonly sampleDataRegistry = new SampleDataRegistry(this.initContext);

  public setup(core: CoreSetup, plugins: HomeServerPluginSetupDependencies): HomeServerPluginSetup {
    core.capabilities.registerProvider(capabilitiesProvider);
    core.savedObjects.registerType(sampleDataTelemetry);
    core.savedObjects.registerType(homepageSavedObjectType);

    const router = core.http.createRouter();
    registerRoutes(router);
    core.uiSettings.register(uiSettings);
    core.uiSettings.register(searchOverviewPageUISetting);

    return {
      tutorials: { ...this.tutorialsRegistry.setup(core) },
      sampleData: { ...this.sampleDataRegistry.setup(core, plugins.usageCollection) },
    };
  }

  public start(): HomeServerPluginStart {
    return {
      tutorials: { ...this.tutorialsRegistry.start() },
      sampleData: { ...this.sampleDataRegistry.start() },
    };
  }
}

/** @public */
export interface HomeServerPluginSetup {
  tutorials: TutorialsRegistrySetup;
  sampleData: SampleDataRegistrySetup;
}

/** @public */
export interface HomeServerPluginStart {
  tutorials: TutorialsRegistryStart;
  sampleData: SampleDataRegistryStart;
}
