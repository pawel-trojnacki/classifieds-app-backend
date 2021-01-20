import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FilesService {
  async uploadFiles(files: Express.Multer.File[]) {
    const s3 = new S3();

    const uploadResult = Promise.all(
      files.map(async ({ buffer, originalname, mimetype }) => {
        return await s3
          .upload({
            Bucket: process.env.AWS_BUCKET,
            Body: buffer,
            ContentType: mimetype,
            Key: `${uuid()}-${originalname}`,
            ACL: 'public-read',
          })
          .promise();
      }),
    );

    return (await uploadResult).map((res) => res.Key);
  }

  async removeFiles(keys: string[]) {
    const s3 = new S3();
    Promise.all(
      keys.map(async (key) => {
        return await s3
          .deleteObject({
            Bucket: process.env.AWS_BUCKET,
            Key: key,
          })
          .promise();
      }),
    );
  }
}
