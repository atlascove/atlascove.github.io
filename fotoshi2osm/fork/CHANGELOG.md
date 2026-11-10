# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Next version (to be released)


## 0.5.30 - 2024-03-04

### Changed
- Support of OAuth 2 in place of OAuth 1 to restore login against OSM API.


## 0.5.29 - 2021-08-19

### Changed
- Support of Mapillary API v4


## 0.5.28 - 2021-06-14

### Added
- Serbian language support

### Changed
- Locales updated


## 0.5.27 - 2021-04-06

### Fixed
- In map from review page, better handling of tiles subdomains


## 0.5.26 - 2021-01-12

### Changed
- Allow map in review page to go to higher zoom levels


## 0.5.25 - 2020-10-28

### Fixed
- Bug when adding new answers on existing missions


## 0.5.21 - 2020-07-28

### Fixed
- Changed URL for Osmose API v0.3


## 0.5.20 - 2020-07-23

### Fixed
- Tags with number-only values were not added to OpenStreetMap properly


## 0.5.19 - 2020-05-26

### Changed
- Use tag `source:position` for Mapillary detections instead of `source:geometry` on nodes


## 0.5.18 - 2020-05-07

### Fixed
- Updated osm-request to fix bug of changeset always re-created


## 0.5.17 - 2020-05-07

### Added
- Mission creation allows to select item + class for Osmose datasets


## 0.5.15 - 2020-01-01

### Fixed
- Remove empty tags before sending to OSM API if any


## 0.5.14 - 2019-12-24

### Changed
- Spanish translation updated


## 0.5.13 - 2019-10-10

### Changed
- German translation updated


## 0.5.12 - 2019-10-09

### Changed
- German translation completed, all locales updated


## 0.5.11 - 2019-07-28

### Fixed
- My mission page was showing missions which are not publicly visible
- Login dialog is now hidden even when authentication check is long due to network delay
- In review page, invalid picture was associated to feature sometimes


## 0.5.10 - 2019-06-20

### Changed
- Update the login icon from [Login](https://materialdesignicons.com/icon/login) to [Account](https://materialdesignicons.com/icon/account); on larger screens, a 'Log In' text button is used

### Fixed
- Error message when feature to review only has one picture
- Typo in the welcome page message in English (see Merge Request !6)


## 0.5.9 - 2019-06-04

### Added
- More information about the editing context is provided in Pic4Review changesets (locale, mission URL)
- Spanish (es) locale added

### Changed
- Gallery of images for review page changed, left/right arrow keys can be used to switch pictures
- Improved usability of review page for all kind of devices (mobile, desktop)
- Button for editing using iD/JOSM now embeds changeset comment and sources
- Clearer documentation for configuring its own Pic4Review instance (`DEVELOP.md` file)
- On "My missions" page, in table for created missions, link to see the mission is on mission name instead of a separate button
- In review page, similar features are searched on OSM.org instead of Overpass (to avoid duplicates)

### Fixed
- Duplicating old missions was causing a bug when showing editors options

### Removed
- Flickr pictures are not used anymore (most of them not being relevant)


## 0.5.8 - 2019-05-08

### Added
- My missions page allows user to search missions they contributed to, in addition to the ones they created
- Mission image is also shown in mission list page on small screen devices (as an avatar)

### Changed
- Move feature button on map of review page is more visible


## 0.5.7 - 2019-04-27

### Added
- Translations of automatic detections feature types in new mission page
- New missions based on Osmose or automatic detections have a thumbnail associated in mission list
- Thumbnail of mission is shown in mission description page
- Missions list can be sorted by pertinence, creation date and completeness
- Alert dialog shown when trying to import a new feature when another exists around

### Changed
- Home page now offers a better view of Pic4Review and some statistics
- Map of features in mission description page shows the features you skipped in review

### Fixed
- New features created in import missions where lacking pictures tags


## 0.5.6 - 2019-04-01

### Added
- New mission type : importing new feature from open data into OpenStreetMap (using Osmose only for now) !
- Author of a mission can be contacted (link provided in mission description page)
- Integrated editors can be partially disabled according to the used datasource
- Partial support for Polish (pl) locale

### Changed
- List of Osmose errors limited to the ones that make sense for Pic4Review
- Allow in integrated editor configuration to apply some tags only on a specific geometry type with `~node:tag=value` syntax
- If feature geometry is being edited, we show an alert to prevent answer application on old geometry

### Fixed
- Proper validation of settings for mission datasource, in the past empty strings could pass in some cases


## 0.5.5 - 2019-03-01

### Changed
- Imagery is more logically sorted in review map

### Fixed
- When imagery in review page lacks attribution, empty text is shown instead of breaking page


## 0.5.4 - 2019-01-27

### Added
- Missions can now have new kinds of questions : define a color, number or free text for a particular tag
- Missions with single choice answer are now able to delete tags using `-tagname=*` syntax
- Geometry editing is available for some missions (missions working on detached nodes, mainly POI)

### Changed
- In review page, map is now wider
- In review page, for mid-size screens, layout has changed (map next to integrated editor, pictures below)


## 0.5.3 - 2018-10-28

### Added
- In review page, map offers various tile providers according to what's available on the mission area
- When creating a new mission, you can set area using a local geo file (GeoJSON, GPX, KML)
- In general statistics, a new graph shows source of used pictures

### Changed
- In review page, map keeps zoom level and used tiles between two features review
- Links for missions in mission list can now be right-clicked for opening in new tab

### Fixed
- "Show more pictures" button is hidden for complex geometries

### Removed
- Last missing pictures map in general statistics page


## 0.5.2 - 2018-10-24

### Fixed
- Handling of OSM features having no tags in [osm-request library](https://github.com/osmlab/osm-request/)


## 0.5.1 - 2018-09-30

### Fixed
- Pictures sorting order fixed back to date descending (prioritizing pics already associated to feature)


## 0.5.0 - 2018-09-24

### Added
- If feature in mission has complex geometry (other than point), it is properly rendered on review page map
- In mission review, skipped features are not shown two times to the same user
- In mission statistics, a graph shows solved features amount evolution
- A link to code repository is present on homepage

### Changed
- Mission without integrated editor has dedicated icon in missions list
- In personnal mission page, details for each mission has a new layout, and mission completion is shown as bar diagram
- If OSM feature already has associated pictures, we don't change the related tag values
- If OSM feature already has a `survey:date` tag, we only change it if picture date is more recent than existing one
- In various statistics pages, contribution chart is renamed "Activity" chart
- In review page, pictures already linked to current feature are shown before others

### Fixed
- When duplicating mission and changing editor, editor settings are now properly sent to back-end
- Mission having double-quotes in their name are now properly handled (fix in osm-request on XML special characters escaping)
- Missions not having statistics were sometimes creating an error in personal mission dashboard
- User is always redirected to original page after logging in (wasn't working if user landed directly on page needing authentication)
- Interface should not show again same feature if returned twice by API


## 0.4.12 - 2018-08-24

### Added
- Create new mission, the fast way, using templates
- In review page, picture gallery and response image list can be horizontally scrolled using mouse wheel
- In users leaderboard (general and per mission), current user ranking is always shown and highlighted
- Partial support for Japanese (ja) locale

### Changed
- Improved readability of error messages coming from API
- Creation date shown instead of update date in missions list and map
- Create mission link in page header redirects to a two entries page, allowing to choose mission creation tool (templates or scratch)
- On large screens, mission answers on review page can be shown as a multi-line grid if there are many possible answers
- Statistics page can be accessed only if logged-in
- In missions management page, when updating visibility status, a blocking loading is now shown (as API can take some delay to update due to caching system)


## 0.4.11 - 2018-08-09

### Added
- German (de) locale
- Mission management for users ("Your missions" in top-right corner user menu)
- Click on feature over map in review page makes its popup details appear
- Tooltip are shown when mouse is over one mission in missions page's map
- Amount of contributors for a mission is shown in mission list page
- After logging-in, user comes back to page he was coming from

### Changed
- Review page UI changed to make it clearer
- Feature name in review page handles properly advertising features
- Mission details map has better performance thanks to preferCanvas option in Leaflet

### Fixed
- Dependency failure related to babel package
- Background color on done mission in mission list


## 0.2.1 - 2018-01-03

### Fixed
- Exception in Firefox for Osmose dataset
- Missing label in I18n


## 0.2.0 - 2018-01-03

### Added
- Documentation for contributing/develop
- Documentation for JS classes/methods
- Unit test framework Mocha
- Osmose dataset for thematic reviews
- Previous and can't see buttons in review component
- About tab, explains project purpose

### Changed
- Merged webpack configuration files into a single one
- French translation files
- Generic dataset model introduced, controllers and views adapted


## 0.1.0 - 2017-12-20

### Added
- GeoJSON dataset support
- Summary component of review status
- Review component for editing review
