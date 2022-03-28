# Changelog

All notable changes to this project will be documented in this file. See
[standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.36](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.35...v0.1.36) (2022-03-28)

### Features

- include getOptions
  ([af0b842](https://github.com/ngxs-labs/firestore-plugin/commit/af0b8420942b6bc21a1892e96f7b5d5dfc52b791))

### [0.1.35](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.34...v0.1.35) (2022-03-15)

### Bug Fixes

- limit page size at 10000
  ([e6b6988](https://github.com/ngxs-labs/firestore-plugin/commit/e6b6988820baa1af3072d348a486eb814f6f8288))

### [0.1.34](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.33...v0.1.34) (2022-02-14)

### Bug Fixes

- handle trackBy and cancelPrevious scenario
  ([2329a6b](https://github.com/ngxs-labs/firestore-plugin/commit/2329a6bf7cb7fab8addb06448dc2394a57c80c34))

### [0.1.33](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.32...v0.1.33) (2022-02-01)

### Features

- next page and last page
  ([8ba1e61](https://github.com/ngxs-labs/firestore-plugin/commit/8ba1e612952053067ba6dafa48aa02b03b3d8f2a))
- paging ([705bd6b](https://github.com/ngxs-labs/firestore-plugin/commit/705bd6b19c8f09cecf34890b25e3f7023bc64f8a))
- support multiple paged queries
  ([864b503](https://github.com/ngxs-labs/firestore-plugin/commit/864b503d3cf50217997bded572131842ce30f7ea))
- update if exists
  ([f2b2723](https://github.com/ngxs-labs/firestore-plugin/commit/f2b27236d53e3eef35926d2d2ca9dcb1da4c7bc1))

### [0.1.32](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.31...v0.1.32) (2022-01-04)

### Features

- deps ng 12 ([1b3f69a](https://github.com/ngxs-labs/firestore-plugin/commit/1b3f69ab19c9da6bc4f653b0907383baa9404433))
- **deps:** angular/fire 6.1.0
  ([6885163](https://github.com/ngxs-labs/firestore-plugin/commit/68851638b273ca149ec20283e92a510cfaec7b41))
- **deps:** angular/fire@6.1.5
  ([f4c3c08](https://github.com/ngxs-labs/firestore-plugin/commit/f4c3c085713308843a35d157668d3f07f17fffa1))
- **deps:** ng 11
  ([feb2d5d](https://github.com/ngxs-labs/firestore-plugin/commit/feb2d5dfe984b17e14608a955554ee10908f3e6f))

### Bug Fixes

- deps ([5a535ce](https://github.com/ngxs-labs/firestore-plugin/commit/5a535ce631333bf41d2e03af7e00b3130f58587c))
- jest config and deps
  ([2eeb3f7](https://github.com/ngxs-labs/firestore-plugin/commit/2eeb3f76b58754611a72ec8902c82a3ee26cb8eb))

### [0.1.31](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.30...v0.1.31) (2021-07-29)

### [0.1.30](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.29...v0.1.30) (2021-05-29)

### [0.1.29](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.28...v0.1.29) (2021-02-21)

### Features

- add setOptions param to write operations
  ([b91721c](https://github.com/ngxs-labs/firestore-plugin/commit/b91721caa90c927a5e16e244a2e9426e34809b14))

### [0.1.28](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.27...v0.1.28) (2021-01-31)

### Features

- demo of using subcollection
  ([7866972](https://github.com/ngxs-labs/firestore-plugin/commit/7866972ccea07a4683b357927ff6b606d98b5ce3))

### [0.1.27](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.26...v0.1.27) (2020-11-19)

### Bug Fixes

- a null id should not overwrite the payload id
  ([1b86e01](https://github.com/ngxs-labs/firestore-plugin/commit/1b86e0137370cd4cc14972f464247b0b84aa93f5))
- linting error (shadowed type)
  ([4ea9265](https://github.com/ngxs-labs/firestore-plugin/commit/4ea9265f0763e83d832972e9591eb4bf29d68c56))

### [0.1.26](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.25...v0.1.26) (2020-11-19)

### [0.1.25](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.24...v0.1.25) (2020-11-19)

### Bug Fixes

- a null id should not overwrite the payload id
  ([812b89a](https://github.com/ngxs-labs/firestore-plugin/commit/812b89a1af39a049cf74461596016cf67b396b66))

### [0.1.24](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.23...v0.1.24) (2020-11-16)

### Bug Fixes

- create and upsert should use the idField
  ([0de4c40](https://github.com/ngxs-labs/firestore-plugin/commit/0de4c407c7e55dfc42d9b2f8ae8dec0839d39e65))

### [0.1.23](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.22...v0.1.23) (2020-11-16)

### Bug Fixes

- **doc\$:** return undefined if doc doesnt exist
  ([8e5f5eb](https://github.com/ngxs-labs/firestore-plugin/commit/8e5f5ebd2f804f141ed13f2c76789ac66a9e805c))

### [0.1.22](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.21...v0.1.22) (2020-10-27)

### Features

- idField and FirestoreDataConverter
  ([5950a23](https://github.com/ngxs-labs/firestore-plugin/commit/5950a2390804a1df234d550c6ba14842660bd484))
- include mapTo, mapFrom, idField options
  ([bb1cce4](https://github.com/ngxs-labs/firestore-plugin/commit/bb1cce4901fd39724e804062a696b82b4d5f263d))
- offline fire and forget
  ([803f49c](https://github.com/ngxs-labs/firestore-plugin/commit/803f49c2b6bfecdb27880262ad2e94f0fac35178))

### Bug Fixes

- remove ? optional chaning
  ([9b148df](https://github.com/ngxs-labs/firestore-plugin/commit/9b148df118d21d6ef80fa1c7ef15634091b6bdf4))

### [0.1.21](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.20...v0.1.21) (2020-10-27)

### Features

- remove default trackBy payload
  ([9722989](https://github.com/ngxs-labs/firestore-plugin/commit/972298983fe35c7f4669c0483471ea822426cde6))

### [0.1.20](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.19...v0.1.20) (2020-10-26)

### [0.1.19](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.18...v0.1.19) (2020-10-26)

### [0.1.18](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.17...v0.1.18) (2020-10-26)

### Bug Fixes

- cancelPrevious action without trackby
  ([6a4ca2a](https://github.com/ngxs-labs/firestore-plugin/commit/6a4ca2ae5c1fde5bdd2610cede41d380f2a42e80))

### [0.1.17](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.16...v0.1.17) (2020-09-24)

### Bug Fixes

- typing ([5ad61d8](https://github.com/ngxs-labs/firestore-plugin/commit/5ad61d87fe5c935aa8186c217e7ff026df6fc491))

### [0.1.16](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.14...v0.1.16) (2020-09-24)

### Bug Fixes

- create\$ ([1e03085](https://github.com/ngxs-labs/firestore-plugin/commit/1e03085838a178c1f3e284105db6ca0119de3f7e))

### [0.1.15](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.14...v0.1.15) (2020-09-24)

### Bug Fixes

- create\$ ([1e03085](https://github.com/ngxs-labs/firestore-plugin/commit/1e03085838a178c1f3e284105db6ca0119de3f7e))

### [0.1.14](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.13...v0.1.14) (2020-09-24)

### [0.1.13](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.12...v0.1.13) (2020-09-16)

### Bug Fixes

- **firestore-service:** use merge fields on update\$
  ([abf5333](https://github.com/ngxs-labs/firestore-plugin/commit/abf53331588ad76ac810f0c8fb956e3248bf915b))

### [0.1.12](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.11...v0.1.12) (2020-09-03)

### Features

- dispatch stream error
  ([08cde38](https://github.com/ngxs-labs/firestore-plugin/commit/08cde38c4891a049a4ee3df1c1df59fc50ed2bc6))
- make dispatch action error
  ([c481f9f](https://github.com/ngxs-labs/firestore-plugin/commit/c481f9f902cb23dd66ebf2e3b7860e715096802f))

### [0.1.11](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.10...v0.1.11) (2020-08-16)

### Features

- return id on upsert
  ([823faa4](https://github.com/ngxs-labs/firestore-plugin/commit/823faa4f8cbae9fe976fe10af614a6d0175e83f0))

### [0.1.10](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.9...v0.1.10) (2020-08-16)

### Features

- export doc on NgxsFirestore
  ([81d1fa0](https://github.com/ngxs-labs/firestore-plugin/commit/81d1fa01ea2e8d72cf79ed6253fc3097450a3868))

### [0.1.9](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.8...v0.1.9) (2020-08-16)

### Features

- expose docRef on NgxsFirestore
  ([939b286](https://github.com/ngxs-labs/firestore-plugin/commit/939b28656a6e4c763825f883c9146d48954ceec7))

### [0.1.8](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.7...v0.1.8) (2020-08-02)

### Features

- add paging functionality
  ([9e1c515](https://github.com/ngxs-labs/firestore-plugin/commit/9e1c515f6e5fa2c2cfb2a9c33c0d6897fc27969d))
- integration test
  ([0f67da1](https://github.com/ngxs-labs/firestore-plugin/commit/0f67da10405c61141882447bef9df949e78e1fe8))

### Bug Fixes

- allow one paging query per service instance
  ([559c942](https://github.com/ngxs-labs/firestore-plugin/commit/559c942a254c01a1f26f93d337d3f2bd036af240))
- get page impl
  ([7963db5](https://github.com/ngxs-labs/firestore-plugin/commit/7963db5cd18506b2f5cb5c4671eaf9722655d5f2))

### [0.1.7](https://github.com/ngxs-labs/firestore-plugin/compare/v0.1.6...v0.1.7) (2020-07-24)

### [0.1.6](https://github.com/ngxs-labs/firebase-plugin/compare/v0.1.0...v0.1.6) (2020-07-24)

### Features

- add connections selector
  ([b5f52fa](https://github.com/ngxs-labs/firebase-plugin/commit/b5f52fa0a2c9456b1b485a73e93d5d9b941e54c2))
- public ngxs-firestore state
  ([a234fa8](https://github.com/ngxs-labs/firebase-plugin/commit/a234fa8dcc3accd40704947fd739d452086f84b9))
- udpate connections state model
  ([91d391d](https://github.com/ngxs-labs/firebase-plugin/commit/91d391d40493b2dd8798642f2be9dd1dab9962f7))

### Bug Fixes

- import NgxsActionsExecutingModule
  ([342ae10](https://github.com/ngxs-labs/firebase-plugin/commit/342ae1074a9786e41eb1353c2aabacaa03308adc))
- ngxs-firestore-connect make properties private
  ([5306fb8](https://github.com/ngxs-labs/firebase-plugin/commit/5306fb86f1c959a716fa8efacf4ec06b53cc8bc0))
- same action multi dispatch completion handle
  ([8c3c883](https://github.com/ngxs-labs/firebase-plugin/commit/8c3c8835db80b56d861f688078658f6648723df6))
- throw error when id is empty
  ([ff8a7fa](https://github.com/ngxs-labs/firebase-plugin/commit/ff8a7fa24b699f98c217ca81ab357e553e23fd11))
- when connected complete subsequent actions immediately
  ([298530e](https://github.com/ngxs-labs/firebase-plugin/commit/298530e307107062227491ca6a5f603fab382975))

## 0.1.5 (2020-07-24)

### Features

- action dispatched multiple times
  ([6c8647d](https://github.com/ngxs-labs/firebase-plugin/commit/6c8647d7453f4c561ddf693863c1821e470f42ca))
- actionFinishesOn FirstEmit | ObsComplete
  ([3468b7a](https://github.com/ngxs-labs/firebase-plugin/commit/3468b7a22e3993e7105054559b8132c15ba77f83))
- active connections
  ([e4868bb](https://github.com/ngxs-labs/firebase-plugin/commit/e4868bbda5b32f7fa40e9ff6ce770cb2965eef44))
- add connections selector
  ([b5f52fa](https://github.com/ngxs-labs/firebase-plugin/commit/b5f52fa0a2c9456b1b485a73e93d5d9b941e54c2))
- create new page to demo disconnect
  ([2f2e3fe](https://github.com/ngxs-labs/firebase-plugin/commit/2f2e3fe52f398e46eb24448551a2e0dcdcea9fe4))
- include upsert
  ([62bb6bd](https://github.com/ngxs-labs/firebase-plugin/commit/62bb6bd7b0a840a86ae8a93c11a2e34c07e44347))
- multi dispatch strategy
  ([70323d7](https://github.com/ngxs-labs/firebase-plugin/commit/70323d74c9ae7809d875d51dcc854066b8facf72))
- public ngxs-firestore state
  ([a234fa8](https://github.com/ngxs-labs/firebase-plugin/commit/a234fa8dcc3accd40704947fd739d452086f84b9))
- reconnect if no active connections / disconnect based on args
  ([fa2bc4f](https://github.com/ngxs-labs/firebase-plugin/commit/fa2bc4f32e49b3e7301368831b1e9ed241038342))
- support state operators
  ([017cd42](https://github.com/ngxs-labs/firebase-plugin/commit/017cd4282433f2bcd935f36f4de6a08d3f31403e))
- track connection names
  ([e1f0005](https://github.com/ngxs-labs/firebase-plugin/commit/e1f0005939f298e7bba61d2c4781502c7fca7016))
- udpate connections state model
  ([91d391d](https://github.com/ngxs-labs/firebase-plugin/commit/91d391d40493b2dd8798642f2be9dd1dab9962f7))

### Bug Fixes

- action arg on Disconnect
  ([35894d8](https://github.com/ngxs-labs/firebase-plugin/commit/35894d8c8c7541e6d958e32417617973672bba29))
- active conns service
  ([f48cf16](https://github.com/ngxs-labs/firebase-plugin/commit/f48cf1656e68560711078c43a80e3bdb1793294a))
- add [@injectable](https://github.com/injectable) to support Ivy
  ([be889a6](https://github.com/ngxs-labs/firebase-plugin/commit/be889a6ccaa62c4531784e6c434906df50e081ef))
- add @Injectable per Ivy upgrade
  ([23bf3f2](https://github.com/ngxs-labs/firebase-plugin/commit/23bf3f2408f1efb94031a9a172e4e978073d2a95))
- comment disconnect
  ([f7f5707](https://github.com/ngxs-labs/firebase-plugin/commit/f7f570702375307d4c3bd89ad600674df7e8f927))
- connect event takes action as payload
  ([3f049c6](https://github.com/ngxs-labs/firebase-plugin/commit/3f049c620097b16c1de62de22480e0cd06d8b68e))
- create and delete
  ([58a6774](https://github.com/ngxs-labs/firebase-plugin/commit/58a67743484fe58e389d434abef7373f99a7a9ec))
- firestore plugin
  ([e034a70](https://github.com/ngxs-labs/firebase-plugin/commit/e034a70173475a9cd30f07a0784c9f687ce66e6c))
- git repo ([1176e32](https://github.com/ngxs-labs/firebase-plugin/commit/1176e32833e4de22f1fe7cad96a9a6df3744a5cd))
- handle connections in connect service
  ([2276a76](https://github.com/ngxs-labs/firebase-plugin/commit/2276a76fb9e8607bfad4859cf64bc1833ba801fc))
- handle dispatch action multiple times on same tick
  ([99e3de6](https://github.com/ngxs-labs/firebase-plugin/commit/99e3de616e8cc4b5187a90445852275ff8d59239))
- handle multiple actions on different ticks
  ([6c0d30c](https://github.com/ngxs-labs/firebase-plugin/commit/6c0d30c76dd2b99fc3d2f30404b1149ea6b5390d))
- implement attach-action with overwrite method
  ([093b338](https://github.com/ngxs-labs/firebase-plugin/commit/093b338e868ce133a647fb099f6d714b6e18e80d))
- import NgxsActionsExecutingModule
  ([342ae10](https://github.com/ngxs-labs/firebase-plugin/commit/342ae1074a9786e41eb1353c2aabacaa03308adc))
- lint disable no-any
  ([edfa76e](https://github.com/ngxs-labs/firebase-plugin/commit/edfa76e298621648b3708fb071b5ce263e4e26ae))
- lint prefers interface over type
  ([a43bf2b](https://github.com/ngxs-labs/firebase-plugin/commit/a43bf2b498966f06ce51c9d5c91a23cec551c92d))
- list component test
  ([7251d87](https://github.com/ngxs-labs/firebase-plugin/commit/7251d877aeadefea8c3c891b7b55e7653a9f289c))
- make instance test as instance
  ([e8e7924](https://github.com/ngxs-labs/firebase-plugin/commit/e8e792491522cb48b7708b96c80f71774328f9ee))
- ngxs-firestore-connect make properties private
  ([5306fb8](https://github.com/ngxs-labs/firebase-plugin/commit/5306fb86f1c959a716fa8efacf4ec06b53cc8bc0))
- redux devtool actions order
  ([00a420c](https://github.com/ngxs-labs/firebase-plugin/commit/00a420c397327372d6ddc78a8c0707f9e3ae1edf))
- run dispatch on next tick
  ([fd81344](https://github.com/ngxs-labs/firebase-plugin/commit/fd813449cf54292b8de35c91a2f309567ddc5c20))
- same action multi dispatch completion handle
  ([8c3c883](https://github.com/ngxs-labs/firebase-plugin/commit/8c3c8835db80b56d861f688078658f6648723df6))
- set redux plugin module
  ([6d8e00a](https://github.com/ngxs-labs/firebase-plugin/commit/6d8e00a9390ad54a1849191475baef9f6adc0e7d))
- stop getting doc once after update
  ([726e885](https://github.com/ngxs-labs/firebase-plugin/commit/726e885d7c87e270470bd19f32036c3bd883d797))
- streamId format
  ([f6795b4](https://github.com/ngxs-labs/firebase-plugin/commit/f6795b48e757bc4f03f119740cf3a13035e7ac72))
- test ([43abecd](https://github.com/ngxs-labs/firebase-plugin/commit/43abecd6453d488c2199f53799a877b052e68ca8))
- throw error when id is empty
  ([ff8a7fa](https://github.com/ngxs-labs/firebase-plugin/commit/ff8a7fa24b699f98c217ca81ab357e553e23fd11))
- to and trackBy takes action instance
  ([a21aa23](https://github.com/ngxs-labs/firebase-plugin/commit/a21aa2327ec46da413e4022afd79131a4d3efdab))
- typo ([e322db6](https://github.com/ngxs-labs/firebase-plugin/commit/e322db6be167e05a64c07dd6db9f253cfad7c540))
- use generic ([2b0a948](https://github.com/ngxs-labs/firebase-plugin/commit/2b0a9483200d0acdf2e5c95182625ce29df8a23a))
- when connected complete subsequent actions immediately
  ([298530e](https://github.com/ngxs-labs/firebase-plugin/commit/298530e307107062227491ca6a5f603fab382975))
- works ([fe0fe7b](https://github.com/ngxs-labs/firebase-plugin/commit/fe0fe7bb572f95fd8eafdf7740bdb2b986aae395))
