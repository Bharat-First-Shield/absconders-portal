import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'absconders-bucket';

export interface S3UploadResult {
  key: string;
  url: string;
}

export const s3Service = {
  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Buffer,
    absconderId: string,
    fileType: 'images' | 'documents',
    fileName: string
  ): Promise<S3UploadResult> {
    try {
      const key = `absconders/${absconderId}/${fileType}/${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: file.type
      });

      await s3Client.send(command);

      // Generate a presigned URL for immediate access
      const url = await getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      }), { expiresIn: 3600 });

      return {
        key: `s3://${BUCKET_NAME}/${key}`,
        url
      };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file');
    }
  },

  /**
   * Get a presigned URL for file access
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      // Extract the actual key from s3:// URL if provided
      const actualKey = key.startsWith('s3://') 
        ? key.replace(`s3://${BUCKET_NAME}/`, '')
        : key;

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: actualKey
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate file access URL');
    }
  },

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      // Extract the actual key from s3:// URL if provided
      const actualKey = key.startsWith('s3://') 
        ? key.replace(`s3://${BUCKET_NAME}/`, '')
        : key;

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: actualKey
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file');
    }
  }
};