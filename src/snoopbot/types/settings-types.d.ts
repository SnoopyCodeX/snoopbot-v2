type SettingsType = {
    defaultSettings: DefaultSettingsType;
    threads: { [key: string]: DefaultSettingsType };
}

type DefaultSettingsType = {
    prefix: string;
    antiUnsendEnabled: boolean;
    autoGreetEnabled: boolean;
}