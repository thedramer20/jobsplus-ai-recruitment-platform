package com.jobplus.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ChatReplyDTO {
    private String          reply;
    private List<JobLinkDTO> jobs;
}
