import {IViewerOptions} from "../Viewer";
import {ImageSize} from "../Viewer";

export class Settings {
    private static _baseImageSize: number;
    private static _maxImageSize: number;

    public static setOptions(options: IViewerOptions): void {
        Settings._baseImageSize = options.baseImageSize != null ?
            options.baseImageSize :
            ImageSize.Size640;

        Settings._maxImageSize = options.maxImageSize != null ?
            options.maxImageSize :
            ImageSize.Size2048;
    }

    public static get baseImageSize(): number {
        return Settings._baseImageSize;
    }

    public static get maxImageSize(): number {
        return Settings._maxImageSize;
    }
}

export default Settings;