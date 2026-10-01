import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
/* import fs from 'node:fs';

const https = {
	cert: fs
		.readFileSync('/home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/frontend-2/certs/local.crt', 'utf8')
		.toString(),
	key: fs
		.readFileSync('/home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/frontend-2/certs/local.key', 'utf8')
		.toString()
};

console.log(https);
 */
`npx local-ssl-proxy --key /home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/frontend-2/certs/local.key --cert /home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/frontend-2/certs/local.crt --source 5173 --target 5174`

export default defineConfig({
	plugins: [sveltekit()],
});
