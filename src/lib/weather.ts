import {
	Cloud,
	CloudDrizzle,
	CloudFog,
	CloudRainWind,
	Snowflake,
	Sun,
	Wind,
	Zap,
} from 'lucide-react';

export type Weather =
	| 'sunny'
	| 'cloudy'
	| 'rainy'
	| 'windy'
	| 'snowy'
	| 'foggy'
	| 'stormy'
	| 'drizzle';

export const weatherList: Array<Weather> = [
	'sunny',
	'cloudy',
	'rainy',
	'windy',
	'snowy',
	'foggy',
	'stormy',
	'drizzle',
];

export function getWeatherIcon(weather?: Weather) {
	switch (weather) {
		case 'sunny':
			return Sun;
		case 'cloudy':
			return Cloud;
		case 'rainy':
			return CloudRainWind;
		case 'windy':
			return Wind;
		case 'snowy':
			return Snowflake;
		case 'foggy':
			return CloudFog;
		case 'stormy':
			return Zap;
		case 'drizzle':
			return CloudDrizzle;
		default:
			return Cloud;
	}
}

export function getWeatherLabel(weather: Weather) {
	switch (weather) {
		case 'sunny':
			return '맑음';
		case 'cloudy':
			return '구름 많음';
		case 'rainy':
			return '비';
		case 'windy':
			return '바람';
		case 'snowy':
			return '눈';
		case 'foggy':
			return '안개';
		case 'stormy':
			return '폭풍';
		case 'drizzle':
			return '이슬비';
		default:
			return '맑음';
	}
}
