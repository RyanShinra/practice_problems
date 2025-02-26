import * as console from 'console';
import {main} from './hello-world';

const greet = (name: string): string => {
    return `Hello, ${name}!`;
};

const name = 'World';
console.log(greet(name));

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
main();