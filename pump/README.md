# PUMP TEST UTILS

## Pump config file
Please copy [pump-auto.conf](./pump-auto.conf) file into your Pump folder and reboot Pump.
Configured pumps:
* mongo-pump-aggregate
* mongo
* csv
* prometheus
* elasticsearch
* kafka


## Starting data-sinks
To start 3rd party data sinks please execute:
```
cd data & docker-compose -f data-sinks.yml up
```
this will spin-up dockers with:
* Prometheus (with provided config file; UI at 9193)
* ElasticSearch (on port 9200)
* Kafka with zookeeper
* UI for Kafka (on port 9000)
