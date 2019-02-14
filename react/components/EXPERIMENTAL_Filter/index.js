/* eslint-disable camelcase */
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import FilterTag from './FilterTag'

const mountStatementsWithOptions = options => {
  // this preselects all subjects since each filter is a subject
  const optionsKeys = Object.keys(options)
  return optionsKeys.map(key => {
    return {
      subject: key,
      optionKey: key,
    }
  })
}

const filterExtraOptions = (options, alwaysVisibleFilters, statements) => {
  const newOptions = { ...options }
  const optionsKeys = Object.keys(options)
  optionsKeys.forEach(key => {
    if (alwaysVisibleFilters.includes(key)) {
      delete newOptions[key]
    }
  })
  statements.forEach(st => {
    if (st && st.object) {
      delete newOptions[st.optionKey]
    }
  })
  return newOptions
}

const FILTER_VALUE_LABEL_MAX_LENGTH = 13
const truncateFilterValue = filterValue =>
  `${filterValue.substring(0, FILTER_VALUE_LABEL_MAX_LENGTH)}${
    filterValue.length < FILTER_VALUE_LABEL_MAX_LENGTH ? '' : '…'
  }`

/**
 * @visibleName Filter
 */
class EXPERIMENTAL_Filter extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      visibleExtraOptions: [],
      statements: mountStatementsWithOptions(props.options),
    }
  }

  toggleExtraFilterOption = key => {
    const { visibleExtraOptions } = this.state
    const newVisibleExtraOptions = [
      ...(visibleExtraOptions.indexOf(key) === -1 ? [key] : []),
      ...visibleExtraOptions.filter(op => op !== key),
    ]
    this.setState({ visibleExtraOptions: newVisibleExtraOptions })
  }

  handleStatementsUpdate = (newValue, structure, optionKey) => {
    const { statements } = this.state
    const newStatements = statements.map(st => {
      if (st.optionKey === optionKey) {
        st = {
          ...st,
          [structure]: newValue,
        }
        return st
      }
      return st
    })
    this.setState({ statements: newStatements })
    this.props.onChangeStatements(newStatements)
  }

  handleMoreOptionsSelected = st => {
    const { statements } = this.state
    const newStatements = statements.map(_st => {
      if (_st.subject === st.subject) {
        return {
          ...st,
          optionKey: st.subject,
        }
      }
      return _st
    })
    this.setState({ statements: newStatements })
    this.props.onChangeStatements(newStatements)
    this.toggleExtraFilterOption(st.subject)
  }

  handleFilterClear = optionKey => {
    const { statements } = this.state
    const { alwaysVisibleFilters } = this.props
    const newStatements = statements.map(_st => {
      if (_st.optionKey === optionKey) {
        return {
          subject: optionKey,
          optionKey,
        }
      }
      return _st
    })
    this.setState({ statements: newStatements })
    this.props.onChangeStatements(newStatements)
    !alwaysVisibleFilters.includes(optionKey) &&
      this.toggleExtraFilterOption(optionKey)
  }

  componentDidMount() {
    console.warn(
      `Experimental component warning:

       Filter component is in an experimental state.
       This component may suffer breaking changes in a near future, even in minor or patch versions.
       It may even cease to exist without further notice 👻`
    )
  }

  render() {
    const { options, moreOptionsLabel, alwaysVisibleFilters } = this.props
    const { statements, visibleExtraOptions } = this.state
    const optionsKeys = Object.keys(options)

    return (
      optionsKeys.length > 0 && (
        <div className="flex flex-wrap w-100">
          {optionsKeys
            .filter(
              key =>
                alwaysVisibleFilters.includes(key) ||
                visibleExtraOptions.includes(key)
            )
            .map(optionKey => {
              const statement = statements.find(
                st => st.optionKey === optionKey
              )
              return (
                <div key={`VTEX__filter_option--${optionKey}`} className="ma2">
                  <FilterTag
                    alwaysVisible={alwaysVisibleFilters.includes(optionKey)}
                    subjectPlaceholder={'Select subject'}
                    emptyFilterLabel="Any"
                    filterLabel={
                      (statement &&
                        statement.object &&
                        typeof statement.object === 'string' &&
                        truncateFilterValue(statement.object)) ||
                      ''
                    }
                    optionKey={optionKey}
                    options={options}
                    statements={statements}
                    onClickClear={() => this.handleFilterClear(optionKey)}
                    onChangeFilterStatements={this.handleStatementsUpdate}
                  />
                </div>
              )
            })}
          {alwaysVisibleFilters.length + visibleExtraOptions.length !==
            optionsKeys.length && (
            <div className="ma2">
              <FilterTag
                isMoreOptions
                subjectPlaceholder="Select a filter…"
                filterLabel={moreOptionsLabel}
                options={{
                  ...filterExtraOptions(
                    options,
                    alwaysVisibleFilters,
                    statements
                  ),
                }}
                onSubmitFilterStatement={this.handleMoreOptionsSelected}
              />
            </div>
          )}
        </div>
      )
    )
  }
}

EXPERIMENTAL_Filter.defaultProps = {
  options: [],
  moreOptionsLabel: 'More',
  alwaysVisibleFilters: [],
}

EXPERIMENTAL_Filter.propTypes = {
  /** filter options (mirroring statements from Conditions component) */
  options: PropTypes.object.isRequired,
  /** Filters change callback: returns array of statement definitions */
  onChangeStatements: PropTypes.func,
  /** lable for MORE options */
  moreOptionsLabel: PropTypes.string,
  /** filter options that are always visible outside MORE options */
  alwaysVisibleFilters: PropTypes.arrayOf(PropTypes.string),
}

export default EXPERIMENTAL_Filter
