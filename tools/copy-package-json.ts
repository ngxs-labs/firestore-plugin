import { join } from 'path';
import { existsSync, createReadStream, createWriteStream } from 'fs';
import { name } from '../package.json';

function copyPackageJsonAfterSuccessfulBuild(): void {
    const path = join(__dirname, '../src/package.json');
    const notExists = !existsSync(path);

    if (notExists) {
        return console.log(`Package.json doesn't exist`);
    }

    createReadStream(path)
        .pipe(createWriteStream(join(__dirname, `../dist/${name}/package.json`)))
        .on('finish', () => {
            console.log(`Successfully copied package.json into dist/${name} folder!`);
        });
}

copyPackageJsonAfterSuccessfulBuild();
