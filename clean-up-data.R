library(tidyverse)

deficits = read_csv("deficits.csv") %>% 
  filter(year < 2019)

unemployement = read_csv("unemployment.csv") %>% 
  gather(key = month, value = value, 2:13) %>% 
  group_by(year) %>% 
  summarize(unemployment = mean(value))

data = deficits %>% cbind("unemployment" = unemployement$unemployment)

write_csv(data, "data.csv")
