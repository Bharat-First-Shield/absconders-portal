# AWS Deployment Guide 🌍

This guide provides step-by-step instructions on deploying the **Absconders Portal** on AWS. Ensure you have the necessary AWS services configured before proceeding.

## Prerequisites ⚙️

Before starting the deployment, make sure you have:
- An **AWS account** with administrative privileges.
- **AWS CLI** installed and configured.
- **Node.js** and **npm** installed.
- An **S3 bucket** for static file hosting (optional but recommended).
- A **Relational Database Service (RDS) instance** for database storage (if applicable).
- A **EC2 instance** or **Elastic Beanstalk** for hosting the application.

## Deployment Steps 🚀

### 1. Set Up AWS CLI 💻
Ensure AWS CLI is installed and configured with your credentials:
```bash
aws configure
```
Enter your AWS Access Key, Secret Key, default region, and output format.

### 2. Create an S3 Bucket (Optional) 🌐
If you want to store static assets in an S3 bucket:
```bash
aws s3 mb s3://your-absconders-portal-bucket
```
Enable public access (if required) and configure permissions accordingly.

### 3. Deploy the Database (RDS) 📁
If using a relational database:
```bash
aws rds create-db-instance \
    --db-instance-identifier absconders-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --allocated-storage 20 \
    --master-username admin \
    --master-user-password yourpassword
```
Wait for the instance to become available and note the endpoint.

### 4. Deploy the Backend to EC2 🏢
#### a) Launch an EC2 Instance
```bash
aws ec2 run-instances \
    --image-id ami-12345678 \
    --count 1 \
    --instance-type t2.micro \
    --key-name your-key-pair \
    --security-groups your-security-group
```
Take note of the **Public IP Address** of the instance.

#### b) SSH into the EC2 Instance
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

#### c) Install Dependencies & Start the Server
```bash
sudo yum update -y
sudo yum install nodejs npm -y
git clone https://github.com/pragnesh-singh-rajput/absconders-portal.git
cd absconders-portal
npm install
npm start
```

### 5. Set Up an Application Load Balancer (Optional) 🌐
To improve availability, configure an AWS Elastic Load Balancer:
```bash
aws elbv2 create-load-balancer --name absconders-lb --type application --subnets subnet-123456 subnet-789012
```

### 6. Deploy the Frontend to S3 (Optional) 🏡
If using S3 for hosting the frontend:
```bash
aws s3 cp ./frontend s3://your-absconders-portal-bucket --recursive
```
Ensure the bucket policy allows public read access.

### 7. Configure a Domain Name (Route 53) 🏰
If using a custom domain, set up Route 53:
- Create a hosted zone for your domain.
- Add an **A record** pointing to your EC2 instance or Load Balancer.

### 8. Enable HTTPS with AWS Certificate Manager 🔒
Secure your application with an SSL certificate:
```bash
aws acm request-certificate --domain-name example.com --validation-method DNS
```
Follow the instructions to verify ownership and attach the certificate to your Load Balancer.

## Monitoring and Scaling 📊
To ensure high availability and performance:
- Enable **CloudWatch Logs** for monitoring:
  ```bash
  aws logs create-log-group --log-group-name absconders-logs
  ```
- Set up **Auto Scaling Groups** to dynamically adjust EC2 instances based on traffic.

## Cleaning Up Resources 🛋
To avoid unnecessary charges, terminate unused resources:
```bash
aws ec2 terminate-instances --instance-ids i-1234567890abcdef
aws s3 rm s3://your-absconders-portal-bucket --recursive
aws rds delete-db-instance --db-instance-identifier absconders-db
```

## Conclusion 🌟
Your **Absconders Portal** is now deployed on AWS! Monitor the application regularly, scale resources as needed, and ensure security best practices are followed. Happy coding! 🚀
