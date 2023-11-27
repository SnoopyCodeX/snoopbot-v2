import { writeFileSync } from 'fs'
import jsonSettings from '@snoopbot/lib/settings.json'

export default class Settings {
    public constructor() {}

    public static getSettings() : SettingsType {
        return jsonSettings
    }

    public static saveSettings(settings: SettingsType) : void {
        writeFileSync(`${process.cwd()}/src/snoopbot/lib/settings.json`, JSON.stringify(settings, undefined, 4), {encoding: "utf8"})
    }
}