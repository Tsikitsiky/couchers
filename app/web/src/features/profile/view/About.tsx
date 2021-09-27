import { Typography } from '@material-ui/core'
import Divider from 'components/Divider'
import Markdown from 'components/Markdown'
import {
  ADDITIONAL,
  HOBBIES,
  LIVED_IN,
  OVERVIEW,
  TRAVELED_TO,
  TRAVELS,
  WHO,
} from 'features/constants'
import {
  LabelsAgeGenderLanguages,
  RemainingAboutLabels,
} from 'features/user/UserTextAndLabel'
import { User } from 'proto/api_pb'
import makeStyles from 'utils/makeStyles'

import { useRegions } from '../hooks/useRegions'

interface AboutProps {
  user: User.AsObject
}
const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
  },
  countriesContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(1),
    '& > div': {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
    },
  },
  travelsContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(1),
    '& > div': {
      display: 'flex',
      flexDirection: 'column',
    },
  },

  countriesList: {
    listStyle: 'none',
    margin: theme.spacing(0, 1),
    padding: 0,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '12px',
    // '& > li ~ li::before': {
    //   content: ', ',
    // },
  },
  countryLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  traveledToColor: {
    width: '100%',
    display: 'block',
    height: theme.spacing(0.5),
    backgroundColor: theme.palette.primary.main,
  },
  livedInColor: {
    width: '100%',
    display: 'block',
    height: theme.spacing(0.5),
    backgroundColor: theme.palette.secondary.main,
  },
  labelMarker: {
    fontWeight: 'bold',
    display: 'inline-block',
    width: theme.spacing(1),
    height: theme.spacing(1),
    marginRight: theme.spacing(2),
  },

  marginTop3: {
    marginTop: theme.spacing(3),
  },
}))

export default function About({ user }: AboutProps) {
  const classes = useStyles()
  const { regions } = useRegions()
  return (
    <div className={classes.root}>
      <Typography variant='h1'>{OVERVIEW}</Typography>
      <LabelsAgeGenderLanguages user={user} />
      <RemainingAboutLabels user={user} />
      <Divider className={classes.marginTop3} />
      {user.aboutMe && (
        <>
          <Typography variant='h1'>{WHO}</Typography>
          <Markdown source={user.aboutMe} />
          <Divider className={classes.marginTop3} />
        </>
      )}
      {user.thingsILike && (
        <>
          <Typography variant='h1'>{HOBBIES}</Typography>
          <Markdown source={user.thingsILike} />
          <Divider className={classes.marginTop3} />
        </>
      )}
      {user.additionalInformation && (
        <>
          <Typography variant='h1'>{ADDITIONAL}</Typography>
          <Markdown source={user.additionalInformation} />
          <Divider className={classes.marginTop3} />
        </>
      )}
      <Typography variant='h1'>{TRAVELS}</Typography>
      <div className={classes.countriesContainer}>
        <div>
          <div className={classes.countryLabel}>
            <span
              className={`${classes.traveledToColor} ${classes.labelMarker}`}></span>
            <Typography variant='body1'>{TRAVELED_TO}</Typography>
          </div>
          <div className={classes.countryLabel}>
            <span
              className={`${classes.livedInColor} ${classes.labelMarker}`}></span>
            <Typography variant='body1'>{LIVED_IN}</Typography>
          </div>
        </div>
        {regions ? (
          <div className={classes.travelsContainer}>
            <div>
              <span className={classes.traveledToColor}></span>
              <ul className={classes.countriesList}>
                {user.regionsVisitedList.map((country) => (
                  <li key={`Visited ${country}`}>
                    <Typography variant='body1'>{regions[country]}</Typography>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className={classes.livedInColor}></span>
              <ul className={classes.countriesList}>
                {user.regionsLivedList.map((country) => (
                  <li key={`Lived in ${country}`}>
                    <Typography variant='body1'>{regions[country]}</Typography>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
