Dear, 

I’ve completed performance test on frequently used API for test App. 
Test executed for the below mentioned scenario in server 000.000.000.00. 

1000 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is ~ 80 And Total Concurrent API requested: 700.
2000 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is ~ 78 And Total Concurrent API requested: 1400.
3000 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is ~ 85 And Total Concurrent API requested: 2100.
4000 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is ~ 130 And Total Concurrent API requested: 2800.

While executed 3000 concurrent request, found  38 request got connection timeout and error rate is 0.18%. 

Summary: Server can handle almost concurrent 3500 API call with almost zero (0) error rate.
