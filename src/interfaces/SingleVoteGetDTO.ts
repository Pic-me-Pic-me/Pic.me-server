export interface SingleVoteGetDTO {
    voteId: number;
    voteStatus: boolean;
    voteTitle: string;
    currentVote: number;
    createdDate: Date;
    Picture: object[];
}
