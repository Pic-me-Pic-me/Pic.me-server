export interface SingleVoteGetDTO {
    voteId: string;
    voteStatus: boolean;
    voteTitle: string;
    currentVote: number;
    createdDate: Date;
    Picture: object[];
}
