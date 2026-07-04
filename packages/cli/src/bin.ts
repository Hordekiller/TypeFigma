#!/usr/bin/env node

import('./index.js').then(mod => mod.program.parse(process.argv));
