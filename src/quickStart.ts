import type FloatplaneApi from "floatplane";
import type { PlexSettings, Settings } from "./lib/types";

import * as prompts from "./lib/prompts";

import { defaultResoulutions } from "./lib/defaults";

import { loginFloatplane, loginPlex } from "./logins";
import { findClosestEdge } from "./lib/helpers";

import { MyPlexAccount } from "@ctrl/plex";
export const promptPlexSections = async (plexSettings: PlexSettings): Promise<void> => {
	const plexApi = await (new MyPlexAccount(undefined, undefined, undefined, plexSettings.token).connect());
	const servers = (await plexApi.resources()).filter(resource => resource.provides.split(",").indexOf("server") !== -1);
	const serverSections = await Promise.all(servers.map(async server => {
		const connectedServer = await server.connect();
		const library = await connectedServer.library();
		return (await library.sections()).filter(section => section.type === "show");
	}));
	plexSettings.sectionsToUpdate = await prompts.plex.sections(plexSettings.sectionsToUpdate, serverSections.flatMap(sections => sections));
	if (plexSettings.sectionsToUpdate.length === 0) {
		console.log("You didnt specify any plex sections to update! Disabling plex integration...\n");
		plexSettings.enabled = false;
	}
};

export const validatePlexSettings = async (plexSettings: PlexSettings, promptOnMissing: boolean): Promise<void> => {
	if (plexSettings.enabled) {
		if (plexSettings.token === "") {
			if (promptOnMissing) console.log("Missing plex token!");
			plexSettings.token = await loginPlex();
		}
		if (plexSettings.sectionsToUpdate.length === 0) {
			if (promptOnMissing) console.log("No plex sections specified to update!");
			await promptPlexSections(plexSettings);
		}
	}
};

export const quickStart = async (settings: Settings, fApi: FloatplaneApi): Promise<void> => {
	console.log("Welcome to Floatplane Downloader! Thanks for checking it out <3.");
	console.log("According to your settings.json this is your first launch! So lets go through the basic setup...\n");
	console.log("\n== \u001b[38;5;208mGeneral\u001b[0m ==\n");

	settings.videoFolder = await prompts.settings.videoFolder(settings.videoFolder);
	settings.floatplane.videosToSearch = await prompts.floatplane.videosToSearch(settings.floatplane.videosToSearch);
	settings.downloadThreads = await prompts.settings.downloadThreads(settings.downloadThreads);
	settings.floatplane.videoResolution = await prompts.settings.videoResolution(settings.floatplane.videoResolution, defaultResoulutions);
	settings.fileFormatting = await prompts.settings.fileFormatting(settings.fileFormatting, settings._fileFormattingOPTIONS);

	const extras = await prompts.settings.extras(settings.extras);
	for (const extra in settings.extras) settings.extras[extra] = extras.indexOf(extra) > -1?true:false;

	settings.repeat.enabled = await prompts.settings.repeat(settings.repeat.enabled);
	if (settings.repeat.enabled) settings.repeat.interval = await prompts.settings.repeatInterval(settings.repeat.interval);

	console.log("\n== \u001b[38;5;208mFloatplane\u001b[0m ==\n");
	console.log("Next we are going to login to floatplane...");
	await loginFloatplane(fApi);

	// Prompt to find best edge server for downloading
	if (await prompts.findClosestServerNow()) settings.floatplane.edge = findClosestEdge(await fApi.api.edges()).hostname;
	console.log(`Closest edge server found is: "${settings.floatplane.edge}"\n`);

	// Prompt & Set auto finding best edge server
	settings.floatplane.findClosestEdge = await prompts.settings.autoFindClosestServer(settings.floatplane.findClosestEdge);

	console.log("\n== \u001b[38;5;208mPlex\u001b[0m ==\n");
	settings.plex.enabled = await prompts.plex.usePlex(settings.plex.enabled);
	if (settings.plex.enabled) {
		settings.plex.token = await loginPlex();
		await promptPlexSections(settings.plex);
	}
	console.log("\n== \u001b[36mAll Setup!\u001b[0m ==\n");
};