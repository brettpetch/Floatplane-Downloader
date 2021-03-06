export type Resolutions = [360, 720, 1080, 2160];

import type { Video as fApiVideo } from "floatplane/creator";
export type ChannelOptions = {
	creatorId?: string;
	title: string;
	skip: boolean;
	identifier: {
		check: string;
		type: keyof fApiVideo;
	};
};

export type ChannelAliases = { [key: string]: string };
export type SubChannels = {
	[key: string]: {
		channels: ChannelOptions[];
	};
};

export type PlexSettings = {
	sectionsToUpdate: string[];
	enabled: boolean;
	token: string;
}

export type Extras = { [key: string]: boolean }
export type Settings = {
	runQuickstartPrompts: boolean;
	videoFolder: string;
	downloadThreads: number;
	floatplane: {
		findClosestEdge: boolean;
		videoResolution: ValueOf<Resolutions>;
		edge: string;
		videosToSearch: number;
	};
	_fileFormattingOPTIONS: string[];
	fileFormatting: string;
	auth: {
		encrypt: boolean;
		encryptionKey: string;
	};
	repeat: {
		enabled: boolean;
		interval: string;
	};
	extras: Extras;
	downloadUpdateTime: number;
	subscriptions: {
		[key: string]: {
			creatorId: string,
			title: string,
			skip: boolean,
			channels: ChannelOptions[]
		}
	};
	plex: PlexSettings;
	colourList: {
		[key: string]: string;
	};
};
