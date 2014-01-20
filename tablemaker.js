function tablemaker() {
    var submit_function;

    var fix_numbers = function(container, config) {
        config = (typeof config === "undefined") ? {} : config;
        var currency_decimals = (typeof config.currency_decimals !== "undefined") ? config.currency_decimals : 2;

        if(typeof container === "undefined") {
            container = $('body');
        }
        container.find('.number').number(true);
        container.find('.number-percent').number(true, 2).append(('<span>%</span>'));
        container.find('.number-currency').number(true, currency_decimals).prepend('<span>$</span>');
    };

    // given a array of containers, empty them
    var empty_containers = function(container_array) {
        $.each(container_array, function(k, v) {
            if (v.hasClass("ui-progressbar")) {
                v.progressbar('destroy');
            }
            v.empty();
        });
    }

    // given an array of containers, empty them and add progressbar
    var add_progressbar = function(container_array) {
        empty_containers(container_array);
        $.each(container_array, function(k, v) {
            v.progressbar({ value: false });
        });
    };

    var create_table = function(container, d, config) {
        if (container.hasClass("ui-progressbar")) {
            container.progressbar('destroy');
        }
        container.empty();

        var table = $('<table></table>');
        var thead = $('<thead></thead>');
        var tbody = $('<tbody></tbody>');
        var tfoot = $('<tfoot></tfoot>');
        var data = d['data'];
        var totals = d['totals'];

        var table_classes = 'table table-striped table-hover';
        var titles = [];
        var col_types = [];
        var tbody_col_classes = [];
        var table_sort_order = [0,0];
        var display_index = false;
        var skip_cols = false;

        // no data
        if (typeof(d) === 'undefined' || typeof(data[0]) === 'undefined') {
            container.text('no data... :(');
            return;
        }

        $.each(data[0], function(k, v) {
            if (!v) {
                v = '';
            }
            if (typeof(v) == 'number') {
                v = v.toString();
            }
            if (k.charAt(0) == '%') {
                col_types.push('percent');
            } else if (k.charAt(0) == '$') {
                col_types.push('currency');
            } else if (v.match(/^\-?\d+.?\d+$/)) {
                col_types.push('number');
            } else if (k === 'url') {
                col_types.push('url');
            } else {
                col_types.push('');
            }
            var text = '-';
            if (typeof(k) !== 'undefined') {
                text = toTitleCase(k.replace(/^%|_/g, ' '));
                text.replace(/^  *|  *$/g, '');
            }
            titles.push(text);
        });

        if (config) {
            if (config["table-classes"]) {
                table_classes = config["table-classes"];
            }
            if (config["table-id"]) {
                table.attr("id", config["table-id"]);
            }
            if (config["custom-thead-titles"] || config["custom-thead-titles"] === false) {
                titles = config['custom-thead-titles'];
            }
            if (config["custom-tbody-types"]) {
                col_types = config["custom-tbody-types"];
            }
            if (config["tbody-col-classes"]) {
                tbody_col_classes = config["tbody-col-classes"];
            }
            if (config["table-sort-order"] || config["table-sort-order"] === false) {
                table_sort_order = config["table-sort-order"];
            }
            if (config["display-index"]) {
                display_index = config["display-index"];
            }
            if (config["skip-cols"]) {
                skip_cols = config["skip-cols"];
            }
        }

        table.addClass(table_classes);

        if (titles) {
            var row = $('<tr></tr>');
            if (display_index) {
                row.append($('<th>#</th>'));
            }
            var index = 0;
            $.each(titles, function(i, v) {
                if (skip_cols) {
                    if (skip_cols[index]) {
                        return true;
                    }
                }
                var cell = $('<th>'+v+'</th>');
                row.append(cell);
                index++;
            });
            thead.append(row);
            table.append(thead);
        }

        var rindex = 0;
        $.each(data, function(a, b) {
            var row = $('<tr></tr>');
            if(config) {
                if (typeof(config["tbody-row-classes"]) !== 'undefined') {
                    row.addClass(config["tbody-row-classes"]);
                }
                if (typeof(config["tbody-row-css"]) !== 'undefined') {
                    row.css(config["tbody-row-css"]);
                }
            }
            var index = 0;
            $.each(b, function(k, v) {
                var col;
                if (display_index && index === 0) {
                    var col = $('<td class="number">'+rindex+'</td>');
                    row.append(col);
                }
                if (skip_cols) {
                    if (skip_cols[index]) {
                        return true;
                    }
                }
                if (col_types[index] == 'percent') {
                    col = $('<td class="number-percent">'+(v*100)+'</td>');
                } else if (col_types[index] == 'currency') {
                    col = $('<td class="number-currency">'+v+'</td>');
                } else if (col_types[index] == 'number') {
                    col = $('<td class="number">'+v+'</td>');
                } else if (col_types[index] == 'url') {
                    var display = v;
                    if (!v.match(/^http:\/\//)) {
                        v = 'http://' + v;
                    }
                    col = $('<td><a target="_blank" href="' + v + '">' + display + '</a></td>');
                } else {
                    col = $('<td>'+v+'</td>');
                }
                col.addClass(tbody_col_classes[index]);
                row.append(col);
                index++;
            });
            tbody.append(row);
            rindex++;
        });

        table.append(tbody);
        if (totals) {
            var row = $('<tr></tr>');
            var index = 0;
            $.each(totals, function(k, v) {
                var col;
                if (display_index && index === 0) {
                    var col = $('<th> - </th>');
                    row.append(col);
                }
                if (skip_cols) {
                    if (skip_cols[index]) {
                        return true;
                    }
                }
                if (col_types[index] == 'percent') {
                    col = $('<th class="number-percent">'+(v*100)+'</th>');
                } else if (col_types[index] == 'currency') {
                    col = $('<th class="number-currency">'+v+'</th>');
                } else if (col_types[index] == 'number') {
                    col = $('<th class="number">'+v+'</th>');
                } else if (col_types[index] == 'url') {
                    col = $('<th><a target="_blank" href="' + v + '">' + v + '</a></th>');
                } else {
                    col = $('<th>'+v+'</th>');
                }

                row.append(col);
                index++;
            });
            tfoot.append(row);
            table.append(tfoot);
        }

        // TODO tfoot (sum floats/ints, detect percentage and average)
        if (table_sort_order) {
            table.tablesorter({sortList:[table_sort_order]});
        }
        container.append(table);
        fix_numbers(undefined, config);
    };

    return {
        'add_progressbar'  : add_progressbar,
        'create_table'     : create_table
    };
}

