#!/bin/bash

current_date=$(date +'%d%m%Y_%H%M%S')
file_name="site_${current_date}.zip"
zip -q -r "${file_name}" Procfile package* server/ src/
aws s3 cp "${file_name}" "s3://elasticbeanstalk-sa-east-1-870767750120/$file_name"
aws elasticbeanstalk create-application-version --application-name "langslearning-site" --version-label "${current_date}" --source-bundle S3Bucket="elasticbeanstalk-sa-east-1-870767750120",S3Key="${file_name}"
aws elasticbeanstalk update-environment --environment-name "LangslearningSite-env" --version-label "${current_date}"