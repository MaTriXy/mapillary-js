/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/when/when.d.ts" />

import * as when from "when";

import {IAPINavIm, APIv2} from "../../src/API";
import {TilesService} from "../../src/Graph";

describe("TilesService", () => {
    var tilesService: TilesService;
    var apiV2: APIv2;

    beforeEach(() => {
        apiV2 = new APIv2("MkJKbDA0bnZuZlcxeTJHTmFqN3g1dzo5NWEzOTg3OWUxZDI3MjM4")
        tilesService = new TilesService(apiV2);
    });

    it("exists", () => {
        expect(tilesService).toBeDefined();
    });

    it("cache im tile", (done) => {
        let key: string = "key";
        let h: string = "h";

        spyOn(apiV2.nav, 'im').and.callFake(() => {
            let result: IAPINavIm = {
                hs: [h],
                ims: [{key: key}],
                ss: [],
            };

            return when(result);
        });

        tilesService.cachedTiles$.subscribe((tilesCache: {[key: string]: boolean}) => {
            expect(tilesCache[h]).toBe(true);
            done();
        });

        tilesService.cacheIm$.onNext(key);
    });

    it("cache h tile", (done) => {
        let key: string = "key";
        let h: string = "h";

        spyOn(apiV2.nav, 'h').and.callFake(() => {
            let result: IAPINavIm = {
                hs: [h],
                ims: [{key: key}],
                ss: [],
            };

            return when(result);
        });

        tilesService.cachedTiles$.subscribe((tilesCache: {[key: string]: boolean}) => {
            expect(tilesCache[h]).toBe(true);
            done();
        });

        tilesService.cacheH$.onNext(h);
    });
});