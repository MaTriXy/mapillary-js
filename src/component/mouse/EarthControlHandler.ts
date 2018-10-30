import * as THREE from "three";

import {
    empty as observableEmpty,
    concat as observableConcat,
    merge as observableMerge,
    of as observableOf,
    Subscription,
    Observable,
} from "rxjs";

import {
    map,
    filter,
    withLatestFrom,
    share,
    switchMap,
    pairwise,
    startWith,
    takeWhile,
} from "rxjs/operators";

import {
    Component,
    IMouseConfiguration,
    HandlerBase,
} from "../../Component";
import {
    Transform,
    ViewportCoords,
} from "../../Geo";
import {
    RenderCamera,
} from "../../Render";
import {
    State,
} from "../../State";
import {
    Container,
    Navigator,
} from "../../Viewer";

export class EarthControlHandler extends HandlerBase<IMouseConfiguration> {
    private _viewportCoords: ViewportCoords;

    private _panSubscription: Subscription;
    private _preventDefaultSubscription: Subscription;

    constructor(
        component: Component<IMouseConfiguration>,
        container: Container,
        navigator: Navigator,
        viewportCoords: ViewportCoords) {
        super(component, container, navigator);

        this._viewportCoords = viewportCoords;
    }

    protected _enable(): void {
        const earth$: Observable<boolean> = this._navigator.stateService.state$.pipe(
            map(
                (state: State): boolean => {
                    return state === State.Earth;
                }),
            share());

        this._preventDefaultSubscription = earth$.pipe(
            switchMap(
                (earth: boolean): Observable<MouseEvent> => {
                    return earth ?
                        this._container.mouseService.mouseWheel$ :
                        observableEmpty();
                }))
            .subscribe(
                (event: WheelEvent): void => {
                    event.preventDefault();
                });

        this._panSubscription = earth$.pipe(
            switchMap(
                (earth: boolean): Observable<[MouseEvent, MouseEvent]> => {
                    if (!earth) {
                        return observableEmpty();
                    }

                    return this._container.mouseService
                    .filtered$(this._component.name, this._container.mouseService.mouseDragStart$).pipe(
                    switchMap(
                        (mouseDragStart: MouseEvent): Observable<MouseEvent> => {
                            const mouseDragging$: Observable<MouseEvent> = observableConcat(
                                observableOf(mouseDragStart),
                                this._container.mouseService
                                    .filtered$(this._component.name, this._container.mouseService.mouseDrag$));

                            const mouseDragEnd$: Observable<MouseEvent> = this._container.mouseService
                                .filtered$(this._component.name, this._container.mouseService.mouseDragEnd$).pipe(
                                map(
                                    (e: Event): MouseEvent => {
                                        return null;
                                    }));

                            return observableMerge(mouseDragging$, mouseDragEnd$).pipe(
                                takeWhile(
                                    (e: MouseEvent): boolean => {
                                        return !!e;
                                    }),
                                startWith(null));
                        }),
                    pairwise(),
                    filter(
                        (pair: [MouseEvent, MouseEvent]): boolean => {
                            return pair[0] != null && pair[1] != null;
                        }));
                }),
            withLatestFrom(
                this._container.renderService.renderCamera$,
                this._navigator.stateService.currentTransform$),
            map(
                ([[previous, current], render, transform]: [[MouseEvent, MouseEvent], RenderCamera, Transform]): number[] => {
                    const element: HTMLElement = this._container.element;

                    const [currentX, currentY]: number[] = this._viewportCoords.canvasPosition(current, element);
                    const currentDirection: THREE.Vector3 =
                        this._viewportCoords.unprojectFromCanvas(
                            currentX,
                            currentY,
                            element,
                            render.perspective)
                                .sub(render.perspective.position)
                                .normalize();

                    const [previousX, previousY]: number[] = this._viewportCoords.canvasPosition(previous, element);
                    const previousDirection: THREE.Vector3 =
                        this._viewportCoords.unprojectFromCanvas(
                            previousX,
                            previousY,
                            element,
                            render.perspective)
                                .sub(render.perspective.position)
                                .normalize();

                    const n: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
                    const p0: THREE.Vector3 = new THREE.Vector3().fromArray(transform.unprojectBasic([0.5, 0.5], 0));
                    p0.z -= 2;

                    const l0: THREE.Vector3 = render.perspective.position.clone();

                    const currentD: number = p0.clone().sub(l0).dot(n) / currentDirection.clone().dot(n);
                    const previousD: number = p0.clone().sub(l0).dot(n) / previousDirection.clone().dot(n);

                    const currentIntersection: THREE.Vector3 = l0.clone().add(currentDirection.multiplyScalar(currentD));
                    const previousIntersection: THREE.Vector3 = l0.clone().add(previousDirection.multiplyScalar(previousD));

                    const direction: number[] = currentIntersection.clone().sub(previousIntersection).multiplyScalar(-1).toArray();

                    return direction;
                }))
            .subscribe(
                (direction: number[]): void => {
                    this._navigator.stateService.pan(direction);
                });
    }

    protected _disable(): void {
        this._panSubscription.unsubscribe();
        this._preventDefaultSubscription.unsubscribe();
    }

    protected _getConfiguration(): IMouseConfiguration {
        return { };
    }
}

export default EarthControlHandler;
