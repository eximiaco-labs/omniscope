import { gql } from "@apollo/client";

export const REVENUE_TRACKING_QUERY = gql`
  query RevenueTracking($date: Date!, $filters: [FilterableFieldInput]) {
    financial {
      revenueTracking(dateOfInterest: $date, filters: $filters) {
        year
        month
        summaries {
          byMode {
            regular
            preContracted
            total
          }
          byKind {
            data {
              name
              regular
              preContracted
              total
            }
          }
          byAccountManager {
            data {
              name
              slug
              regular
              preContracted
              total
              consultingFee
              consultingPreFee
              handsOnFee
              squadFee
            }
          }
          byClient {
            data {
              name
              slug
              regular
              preContracted
              total
              consultingFee
              consultingPreFee
              handsOnFee
              squadFee
            }
          }
          bySponsor {
            data {
              name
              slug
              regular
              preContracted
              total
              consultingFee
              consultingPreFee
              handsOnFee
              squadFee
            }
          }
        }
        regular {
          monthly {
            byAccountManager {
              data {
                name
                slug
                fee
                byClient {
                  data {
                    name
                    slug
                    fee
                    bySponsor {
                      data {
                        name
                        slug
                        fee
                        byCase {
                          data {
                            title
                            slug
                            fee
                            byProject {
                              data {
                                kind
                                name
                                fee
                                rate
                                hours
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
            total
          }
        }
        preContracted {
          monthly {
            total
            byAccountManager {
              data {
                name
                slug
                fee
                byClient {
                  data {
                    name
                    slug
                    fee
                    bySponsor {
                      data {
                        name
                        slug
                        fee
                        byCase {
                          data {
                            title
                            slug
                            fee
                            byProject {
                              data {
                                kind
                                name
                                fee
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
        filterableFields {
          field
          options
          selectedValues
        }
      }
    }
  }
`;
