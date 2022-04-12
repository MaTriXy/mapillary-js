import {
    FisheyeCamera,
    FISHEYE_CAMERA_TYPE,
} from "../geometry/camera/FisheyeCamera";
import {
    PerspectiveCamera,
    PERSPECTIVE_CAMERA_TYPE,
} from "../geometry/camera/PerspectiveCamera";
import {
    SphericalCamera,
    SPHERICAL_CAMERA_TYPE,
} from "../geometry/camera/SphericalCamera";
import { ICamera } from "../geometry/interfaces/ICamera";
import { ICameraFactory } from "../geometry/interfaces/ICameraFactory";

export type CameraCtor = { new(parameters: number[]): ICamera; };

export class ProjectionService implements ICameraFactory {
    private readonly _cameraFactory: { [type: string]: CameraCtor; } = {};

    constructor() {
        this.registerCamera(
            FISHEYE_CAMERA_TYPE,
            FisheyeCamera);
        this.registerCamera(
            PERSPECTIVE_CAMERA_TYPE,
            PerspectiveCamera);
        this.registerCamera(
            SPHERICAL_CAMERA_TYPE,
            SphericalCamera);
    }

    public registerCamera(type: string, ctor: CameraCtor): void {
        this._cameraFactory[type] = ctor;
    }

    public makeCamera(type: string, parameters: number[]): ICamera {
        if (!(type in this._cameraFactory)) {
            return new PerspectiveCamera([0.85, 0, 0]);
        }
        return new this._cameraFactory[type](parameters);
    }
}
