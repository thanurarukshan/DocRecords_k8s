# backend.tf

# Uncomment and configure the following block to use an S3 backend for storing state
# This is an industry best practice for team environments.

/*
terraform {
  backend "s3" {
    bucket         = "docrecords-terraform-state-bucket"
    key            = "eks/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
*/
