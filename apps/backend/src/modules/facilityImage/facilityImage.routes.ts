import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { facilityParamsSchema } from "../facility/facility.schema";
import {
  deleteFacilityImageQuerySchema,
  facilityImagesResponseSchema,
  reorderFacilityImagesRequestSchema,
} from "@slotbook/shared";
import { BadRequestError, FileTooLargeError } from "../../lib/errors";
import {
  deleteFacilityImage,
  reorderFacilityImages,
  uploadFacilityImage,
} from "./facilityImage.service";

export const facilityImageRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/:id/images",
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: facilityParamsSchema,
        response: { 201: facilityImagesResponseSchema },
      },
    },
    async (request, response) => {
      const file = await request.file();
      if (!file) throw new BadRequestError("File is required");

      let data: Buffer;
      try {
        data = await file.toBuffer();
      } catch (err) {
        if (err instanceof fastify.multipartErrors.RequestFileTooLargeError) {
          throw new FileTooLargeError();
        }
        throw err;
      }

      const images = await uploadFacilityImage(
        request.server.drizzle,
        fastify.storage,
        request.log,
        {
          facilityId: request.params.id,
          userId: request.user.id,
          data,
        },
      );
      return response.status(201).send({ images });
    },
  );
  fastify.delete(
    "/:id/images",
    {
      onRequest: [fastify.authenticate],
      schema: {
        querystring: deleteFacilityImageQuerySchema,
        params: facilityParamsSchema,
        response: { 200: facilityImagesResponseSchema },
      },
    },
    async (request, response) => {
      const images = await deleteFacilityImage(
        request.server.drizzle,
        fastify.storage,
        request.log,
        {
          facilityId: request.params.id,
          userId: request.user.id,
          key: request.query.key,
        },
      );
      return response.send({ images });
    },
  );
  fastify.put(
    "/:id/images",
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: reorderFacilityImagesRequestSchema,
        params: facilityParamsSchema,
        response: { 200: facilityImagesResponseSchema },
      },
    },
    async (request, response) => {
      const images = await reorderFacilityImages(request.server.drizzle, {
        facilityId: request.params.id,
        userId: request.user.id,
        keys: request.body.keys,
      });
      return response.send({ images });
    },
  );
};
