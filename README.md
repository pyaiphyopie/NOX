
## Testing

Run the following S3 CLI command to upload an image to the S3 bucket. Note, you must edit the {SourceBucketName} placeholder with the name of the S3 Bucket. This is provided in the stack outputs.

```bash
aws s3 cp './events/white_dog.jpeg' s3://{SourceBucketName}
```

Run the following command to check that a new version of the image has been created in the destination bucket.

```bash
aws s3 ls s3://{DestinationBucketName}
```

## Cleanup

1. Delete the stack

   ```bash
   sam delete --stack-name STACK_NAME
   ```

1. Confirm the stack has been deleted

   ```bash
   aws cloudformation list-stacks --query "StackSummaries[?contains(StackName,'STACK_NAME')].StackStatus"
   ```

---
# NOX Mobile V2

Urban nightlife infrastructure prototype built with Flutter.

## Run

```bash
flutter pub get
flutter run
```
