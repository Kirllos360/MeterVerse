package com.meterverse.reporting.shared.infrastructure.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitMQConfig {

    @Value("${reporting.rabbitmq.queue.report-generation:report-generation}")
    private String reportGenerationQueue;

    @Value("${reporting.rabbitmq.exchange:reporting-exchange}")
    private String exchangeName;

    @Value("${reporting.rabbitmq.routing-key:report.generation}")
    private String routingKey;

    @Bean
    public Queue reportGenerationQueue() {
        return QueueBuilder.durable(reportGenerationQueue)
                .withArgument("x-queue-type", "quorum")
                .withArgument("x-max-length", 50000)
                .withArgument("x-overflow", "reject-publish")
                .build();
    }

    @Bean
    public DirectExchange reportingExchange() {
        return ExchangeBuilder.directExchange(exchangeName)
                .durable(true)
                .build();
    }

    @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue)
                .to(exchange)
                .with(routingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        converter.setCreateMessageIds(true);
        return converter;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        template.setExchange(exchangeName);
        template.setRoutingKey(routingKey);
        template.setConfirmCallback((correlationData, ack, cause) -> {
            if (!ack) {
                org.slf4j.LoggerFactory.getLogger(getClass())
                        .warn("Message delivery failed: {}", cause);
            }
        });
        return template;
    }
}
