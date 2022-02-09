import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {FilterPattern, LogGroup, RetentionDays, SubscriptionFilter} from "aws-cdk-lib/aws-logs";
import {LambdaDestination} from "aws-cdk-lib/aws-logs-destinations";
import * as path from "path";


export class CdkCloudwatchLambdaSubscriptionFilterStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        //Creating an AWS CloudWatch log group for receiving logs
        const logGroup = new LogGroup(this, 'SubscriptionFilterLogGroup', {
            logGroupName: 'demo-app-logs',
            retention: RetentionDays.ONE_MONTH
        })

        //Create lambda function for cloudwatch data
        const logProcessingFunction = new Function(this, 'LogProcessingLambda', {
            code: Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'log.handler',
            runtime: Runtime.NODEJS_14_X,
            memorySize:128
        });

        //Create subscription filter to forward logs to lambda
        const subscriptionFilter = new SubscriptionFilter(this,'LogSubscriptionFilter', {
            logGroup,
            destination: new LambdaDestination(logProcessingFunction),
            filterPattern: FilterPattern.anyTerm('ERROR', 'Error', 'error','404','502'),
        });
    }

}
