type DownloadResult = {
    hasError: boolean;
    message?: string;
    results?: any[];
}

type YTDownloadType = "video" | "audio" | "video+audio"

type DownloadType = "video" | "audio" | "photo_jpg" | "photo_png" | "gif" | "unknown"