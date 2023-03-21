export interface SingleFlowerVoteGetDTO {
    voteId: string;
    voteStatus: boolean;
    voteTitle: string;
    currentVote: number;
    createdDate: Date;
    Picture: object[];
}
