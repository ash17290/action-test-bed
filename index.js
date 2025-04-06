import { readPackageUp } from "read-package-up";
import path from "path";

const fileName = process.argv[2];

const cwd = path.resolve(path.dirname(fileName));
console.debug('CWD', cwd);

const pack = await readPackageUp({ cwd });
console.debug('Package', pack);