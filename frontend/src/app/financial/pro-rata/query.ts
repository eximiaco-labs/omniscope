import { gql } from "@apollo/client";

export const PRO_RATA_QUERY = gql`
  query ProRata($dateOfInterest: Date!) {
    financial {
      revenueTracking(dateOfInterest: $dateOfInterest) {
        month
        year
        day
        proRataInfo {
          byKind {
            data {
              kind
              penalty
              byAccountManager {
                data {
                  name
                  penalty
                  byClient {
                    data {
                      name
                      penalty
                      bySponsor {
                        data {
                          name
                          penalty
                          byCase {
                            data {
                              title
                              penalty
                              byProject {
                                data {
                                  name
                                  partialFee
                                  penalty
                                  byWorker {
                                    data {
                                      name
                                      hours
                                      partialFee
                                      penalty
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
