/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import assert from "assert";
import { CreateNewHeader, IFluidResolvedUrl } from "@fluidframework/driver-definitions";
import { IUser } from "@fluidframework/protocol-definitions";
import { IRequest } from "@fluidframework/component-core-interfaces";
import { InsecureUrlResolver } from "../insecureUrlResolver";

describe("Insecure Url Resolver Test", () => {
    const hostUrl = "https://localhost";
    const ordererUrl = "https://localhost.orderer";
    const storageUrl = "https://localhost.storage";
    const tenantId = "tenantId";
    const tenantKey = "tenantKey";
    const bearer = "bearer";
    const user: IUser = {
        id: "userId",
    };
    const fileName = "fileName";
    let resolver: InsecureUrlResolver;
    let request: IRequest;

    beforeEach(() => {
        resolver = new InsecureUrlResolver(hostUrl, ordererUrl, storageUrl, tenantId, tenantKey, user, bearer);
        request = resolver.createCreateNewRequest(fileName);
    });

    it("Create New Request", async () => {
        assert(!!request.headers?.[CreateNewHeader.createNew],
            "Request should contain create new header");
        const url = `${hostUrl}?fileName=${fileName}`;
        assert.equal(request.url, url, "Request url should match");
    });

    it("Resolved CreateNew Request", async () => {
        const resolvedUrl = await resolver.resolve(request) as IFluidResolvedUrl;
        const documentUrl = `fluid://${new URL(ordererUrl).host}/${tenantId}/${fileName}`;
        assert.equal(resolvedUrl.endpoints.ordererUrl, ordererUrl, "Orderer url should match");
        assert.equal(resolvedUrl.url, documentUrl, "Document url should match");
    });

    it("Test RequestUrl for a component", async () => {
        const resolvedUrl = await resolver.resolve(request);
        const componentId = "component";
        const response = await resolver.getAbsoluteUrl(resolvedUrl, componentId);

        const compUrl = `${hostUrl}/${tenantId}/${fileName}/${componentId}`;
        assert.equal(response, compUrl, "Url should match");
    });
});