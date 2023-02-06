export interface SingleVoteGetDTO {
    voteId: string | number;
    voteStatus: boolean;
    voteTitle: string;
    currentVote: number;
    createdDate: Date;
    Picture: object[];
}
